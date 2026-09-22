#include <jni.h>
#include <string>
#include <vector>
#include <android/log.h>
#include "OpenToonzEngineCore.h"

#define LOG_TAG "OpenToonzNativeBridge"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static OpenToonzEngine::StrokeEngine g_engine;

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeInitEngine(JNIEnv *env, jclass clazz) {
    try {
        // Do not run a two-point makeStroke() self-test during class initialization.
        // OpenToonz StrokeGenerator is a vector-stroke tool and some short/degenerate
        // inputs are not valid candidates for interpolation. Calling makeStroke() here
        // used to put the entire Android process at risk before the editor was visible.
        // The real StrokeEngine below performs generation only for an actual user/project
        // stroke, while its C++ entry point remains exception guarded.
        //
        // Force construction of the real engine and only query its immutable metadata.
        // This keeps OpenToonz as the authoritative drawing engine without doing risky
        // geometry work from JNI class initialization.
        LOGI("OpenToonz Native Drawing Engine loaded: OpenToonz v1.8.0 (commit %s)",
             OpenToonzEngine::StrokeEngine::getCommitSha().c_str());
        return JNI_TRUE;
    } catch (const std::exception& e) {
        LOGE("Exception while initializing OpenToonz drawing engine: %s", e.what());
        return JNI_FALSE;
    } catch (...) {
        LOGE("Unknown error initializing OpenToonz drawing engine");
        return JNI_FALSE;
    }
}

JNIEXPORT jstring JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeGetCommitSha(JNIEnv *env, jclass clazz) {
    return env->NewStringUTF(OpenToonzEngine::StrokeEngine::getCommitSha().c_str());
}

JNIEXPORT jstring JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeGetLicenseNotice(JNIEnv *env, jclass clazz) {
    return env->NewStringUTF(OpenToonzEngine::StrokeEngine::getLicenseNotice().c_str());
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeBeginStroke(
        JNIEnv *env, jclass clazz,
        jfloat x, jfloat y, jfloat pressure,
        jfloat baseSize, jint color, jfloat opacity,
        jboolean isVector, jfloat smoothError) {
    try {
        LOGI("nativeBeginStroke: start=(%.2f, %.2f) pressure=%.3f baseSize=%.2f smoothError=%.2f isVector=%d",
             x, y, pressure, baseSize, smoothError, isVector);
        g_engine.beginStroke(
            (double)x, (double)y, (double)pressure,
            (double)baseSize, (uint32_t)color, (float)opacity,
            (bool)isVector, (double)smoothError
        );
    } catch (const std::exception& e) {
        LOGE("nativeBeginStroke OpenToonz exception: %s", e.what());
    } catch (...) {
        LOGE("nativeBeginStroke OpenToonz unknown exception");
    }
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeAddPoint(
        JNIEnv *env, jclass clazz,
        jfloat x, jfloat y, jfloat pressure) {
    try {
        LOGI("nativeAddPoint: pt=(%.2f, %.2f) pressure=%.3f", x, y, pressure);
        g_engine.addPoint((double)x, (double)y, (double)pressure);
    } catch (const std::exception& e) {
        LOGE("nativeAddPoint OpenToonz exception: %s", e.what());
    } catch (...) {
        LOGE("nativeAddPoint OpenToonz unknown exception");
    }
}

JNIEXPORT jfloatArray JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeEndStroke(JNIEnv *env, jclass clazz) {
    LOGI("nativeEndStroke: invoking OpenToonz StrokeGenerator::filterPoints() and makeStroke() / TStroke::interpolate()");
    try {
        OpenToonzEngine::StrokeResult result = g_engine.endStroke();
        LOGI("nativeEndStroke: stroke generated with %zu quadratic segments, bbox=[%.2f, %.2f, %.2f, %.2f]",
             result.segments.size(), result.minX, result.minY, result.maxX, result.maxY);

        // Pack into flat float array:
    // [segmentCount, minX, minY, maxX, maxY, (for each seg: p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, startThick, midThick, endThick)]
    const size_t segCount = result.segments.size();
    const size_t floatCount = 5 + segCount * 9;
    std::vector<float> buffer(floatCount);

    buffer[0] = (float)segCount;
    buffer[1] = (float)result.minX;
    buffer[2] = (float)result.minY;
    buffer[3] = (float)result.maxX;
    buffer[4] = (float)result.maxY;

    size_t idx = 5;
    for (size_t i = 0; i < segCount; ++i) {
        const auto& s = result.segments[i];
        buffer[idx++] = (float)s.p0.x;
        buffer[idx++] = (float)s.p0.y;
        buffer[idx++] = (float)s.p1.x;
        buffer[idx++] = (float)s.p1.y;
        buffer[idx++] = (float)s.p2.x;
        buffer[idx++] = (float)s.p2.y;
        buffer[idx++] = (float)s.startThick;
        buffer[idx++] = (float)s.midThick;
        buffer[idx++] = (float)s.endThick;
    }

    jfloatArray arr = env->NewFloatArray((jsize)floatCount);
    if (arr != nullptr) {
        env->SetFloatArrayRegion(arr, 0, (jsize)floatCount, buffer.data());
    }
        return arr;
    } catch (const std::exception& e) {
        LOGE("nativeEndStroke OpenToonz exception: %s", e.what());
        return nullptr;
    } catch (...) {
        LOGE("nativeEndStroke OpenToonz unknown exception");
        return nullptr;
    }
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeSetBrushSettings(
        JNIEnv *env, jclass clazz,
        jfloat size, jfloat opacity, jint color) {
    try {
        g_engine.setBrushSize((double)size);
        g_engine.setColor((uint32_t)color);
    } catch (const std::exception& e) {
        LOGE("nativeSetBrushSettings OpenToonz exception: %s", e.what());
    } catch (...) {
        LOGE("nativeSetBrushSettings OpenToonz unknown exception");
    }
}

} // extern "C"

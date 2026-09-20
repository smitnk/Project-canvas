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
        // Verify native OpenToonz drawing objects can actually be initialized
        StrokeGenerator testGenerator;
        testGenerator.clear();
        testGenerator.add(TThickPoint(0.0, 0.0, 1.0), 0.0);
        testGenerator.add(TThickPoint(1.0, 1.0, 1.0), 0.0);
        testGenerator.filterPoints();
        TStroke* stroke = testGenerator.makeStroke(4.0, 0, false);
        if (!stroke) {
            LOGE("Failed to initialize OpenToonz native stroke pipeline");
            return JNI_FALSE;
        }
        delete stroke;
        testGenerator.clear();

        LOGI("OpenToonz Native Drawing Engine initialized successfully: OpenToonz v1.8.0 (commit %s)",
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
    LOGI("nativeBeginStroke: start=(%.2f, %.2f) pressure=%.3f baseSize=%.2f smoothError=%.2f isVector=%d",
         x, y, pressure, baseSize, smoothError, isVector);
    g_engine.beginStroke((double)x, (double)y, (double)pressure, (double)baseSize, (uint32_t)color, (float)opacity, (bool)isVector, (double)smoothError);
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeAddPoint(
        JNIEnv *env, jclass clazz,
        jfloat x, jfloat y, jfloat pressure) {
    LOGI("nativeAddPoint: pt=(%.2f, %.2f) pressure=%.3f", x, y, pressure);
    g_engine.addPoint((double)x, (double)y, (double)pressure);
}

JNIEXPORT jfloatArray JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeEndStroke(JNIEnv *env, jclass clazz) {
    LOGI("nativeEndStroke: invoking OpenToonz StrokeGenerator::filterPoints() and makeStroke() / TStroke::interpolate()");
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
}

JNIEXPORT void JNICALL
Java_com_smitnk_motioncanvas_drawing_OpenToonzNativeBridge_nativeSetBrushSettings(
        JNIEnv *env, jclass clazz,
        jfloat size, jfloat opacity, jint color) {
    g_engine.setBrushSize((double)size);
    g_engine.setColor((uint32_t)color);
}

} // extern "C"

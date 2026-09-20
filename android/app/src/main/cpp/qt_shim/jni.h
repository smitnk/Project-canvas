#ifndef JNI_H_SHIM
#define JNI_H_SHIM

#include <cstdint>
#include <cstddef>
#include <cstring>

typedef uint8_t  jboolean;
typedef int8_t   jbyte;
typedef uint16_t jchar;
typedef int16_t  jshort;
typedef int32_t  jint;
typedef int64_t  jlong;
typedef float    jfloat;
typedef double   jdouble;
typedef jint     jsize;

#define JNI_FALSE 0
#define JNI_TRUE 1

#define JNIEXPORT
#define JNICALL

class _jobject {};
typedef _jobject* jobject;
typedef _jobject* jclass;
typedef _jobject* jstring;
typedef _jobject* jarray;
typedef _jobject* jfloatArray;

struct JNIEnv {
    jstring NewStringUTF(const char* bytes) {
        return (jstring)bytes;
    }
    jfloatArray NewFloatArray(jsize length) {
        float* p = new float[length];
        return (jfloatArray)p;
    }
    void SetFloatArrayRegion(jfloatArray array, jsize start, jsize len, const jfloat* buf) {
        if (array && buf) {
            std::memcpy((float*)array + start, buf, len * sizeof(float));
        }
    }
};

#endif

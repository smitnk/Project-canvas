#ifndef ANDROID_LOG_H
#define ANDROID_LOG_H
#include <cstdio>
#define ANDROID_LOG_INFO 4
#define ANDROID_LOG_ERROR 6
#define __android_log_print(prio, tag, ...) printf("[" tag "] " __VA_ARGS__)
#endif

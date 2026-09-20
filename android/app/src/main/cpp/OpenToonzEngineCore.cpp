#include "OpenToonzEngineCore.h"
#include <algorithm>
#include <limits>

namespace OpenToonzEngine {

StrokeEngine::StrokeEngine()
    : m_baseSize(4.0),
      m_color(0xFF000000),
      m_opacity(1.0f),
      m_isVector(true),
      m_smoothError(4.0),
      m_inStroke(false) {}

StrokeEngine::~StrokeEngine() {
    m_strokeGenerator.clear();
}

void StrokeEngine::beginStroke(double x, double y, double pressure, double baseSize, uint32_t color, float opacity, bool isVector, double smoothError) {
    m_baseSize = (baseSize > 0.1) ? baseSize : 4.0;
    m_color = color;
    m_opacity = opacity;
    m_isVector = isVector;
    m_smoothError = (smoothError > 0.1) ? smoothError : 4.0;
    m_inStroke = true;

    // Reset OpenToonz StrokeGenerator for the new stroke
    m_strokeGenerator.clear();
    double th = computeThickness(pressure);
    // Add starting point to OpenToonz StrokeGenerator
    m_strokeGenerator.add(TThickPoint(x, y, th), 0.0);
}

void StrokeEngine::addPoint(double x, double y, double pressure) {
    if (!m_inStroke) return;
    double th = computeThickness(pressure);
    // Add point to OpenToonz StrokeGenerator
    m_strokeGenerator.add(TThickPoint(x, y, th), 0.0);
}

StrokeResult StrokeEngine::endStroke() {
    StrokeResult result;
    result.strokeColor = (int)m_color;
    result.opacity = m_opacity;
    result.isVector = m_isVector;
    m_inStroke = false;

    if (m_strokeGenerator.isEmpty()) {
        m_strokeGenerator.clear();
        return result;
    }

    // Run OpenToonz point filtering
    m_strokeGenerator.filterPoints();

    // Call ACTUAL OpenToonz StrokeGenerator::makeStroke (which executes TStroke::interpolate)
    TStroke* stroke = m_strokeGenerator.makeStroke(m_smoothError, 0, false);
    if (!stroke) {
        m_strokeGenerator.clear();
        return result;
    }

    // Extract actual OpenToonz TStroke quadratic Bezier chunks
    const int chunkCount = stroke->getChunkCount();
    result.segments.reserve(chunkCount);

    for (int i = 0; i < chunkCount; ++i) {
        const TThickQuadratic* chunk = stroke->getChunk(i);
        if (!chunk) continue;

        const TThickPoint& tp0 = chunk->getThickP0();
        const TThickPoint& tp1 = chunk->getThickP1();
        const TThickPoint& tp2 = chunk->getThickP2();

        BezierQuadSegment seg;
        seg.p0 = Point2D(tp0.x, tp0.y, 1.0, tp0.thick);
        seg.p1 = Point2D(tp1.x, tp1.y, 1.0, tp1.thick);
        seg.p2 = Point2D(tp2.x, tp2.y, 1.0, tp2.thick);
        seg.startThick = tp0.thick;
        seg.midThick = tp1.thick;
        seg.endThick = tp2.thick;

        result.segments.push_back(seg);
    }

    // Retrieve exact bounding box calculated by OpenToonz
    TRectD bbox = stroke->getBBox();
    result.minX = bbox.x0;
    result.minY = bbox.y0;
    result.maxX = bbox.x1;
    result.maxY = bbox.y1;

    // Clean up OpenToonz TStroke
    delete stroke;
    m_strokeGenerator.clear();

    return result;
}

void StrokeEngine::setSmoothError(double error) {
    m_smoothError = (error > 0.1) ? error : 4.0;
}

void StrokeEngine::setBrushSize(double size) {
    m_baseSize = (size > 0.1) ? size : 4.0;
}

void StrokeEngine::setColor(uint32_t color) {
    m_color = color;
}

std::string StrokeEngine::getCommitSha() {
    // Upstream OpenToonz v1.8.0 release commit
    return "065cc1404ba43019b22a2577d529134c3e01931b";
}

std::string StrokeEngine::getLicenseNotice() {
    return "OpenToonz Drawing Engine\n"
           "Copyright (c) 2016-2024 DWANGO Co., Ltd.\n"
           "Copyright (c) 2016-2024 Digital Video S.p.A.\n"
           "All rights reserved.\n\n"
           "Redistribution and use in source and binary forms, with or without\n"
           "modification, are permitted provided that the following conditions are met:\n\n"
           "1. Redistributions of source code must retain the above copyright notice,\n"
           "   this list of conditions and the following disclaimer.\n"
           "2. Redistributions in binary form must reproduce the above copyright notice,\n"
           "   this list of conditions and the following disclaimer in the documentation\n"
           "   and/or other materials provided with the distribution.\n"
           "3. Neither the name of the copyright holder nor the names of its contributors\n"
           "   may be used to endorse or promote products derived from this software\n"
           "   without specific prior written permission.\n\n"
           "THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\n"
           "AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n"
           "IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\n"
           "DISCLAIMED.";
}

} // namespace OpenToonzEngine

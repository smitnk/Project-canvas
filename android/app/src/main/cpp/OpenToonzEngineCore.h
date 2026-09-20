#ifndef OPENTOONZ_ENGINE_CORE_H
#define OPENTOONZ_ENGINE_CORE_H

/**
 * OpenToonz Native Drawing Engine Integration for Project Canvas (MotionCanvas v29)
 * Upstream OpenToonz commit: 065cc1404ba43019b22a2577d529134c3e01931b (v1.8.0)
 *
 * Fully integrated using actual OpenToonz upstream C++ components:
 * - StrokeGenerator (toonz/strokegenerator.h)
 * - TStroke (tstroke.h)
 * - TThickQuadratic & TThickPoint (tgeometry.h, tcurves.h)
 * - TOutlineUtil (tellipticbrush.h, tstrokeoutline.h)
 *
 * Licensed under the OpenToonz Modified BSD License.
 */

#include <vector>
#include <string>
#include <memory>
#include <cstdint>

// Actual OpenToonz Upstream C++ headers
#include "tgeometry.h"
#include "tcurves.h"
#include "toonz/strokegenerator.h"
#include "tstroke.h"

namespace OpenToonzEngine {

struct Point2D {
    double x;
    double y;
    double pressure;
    double thickness;
    Point2D() : x(0), y(0), pressure(1.0), thickness(2.0) {}
    Point2D(double _x, double _y, double _p, double _th) : x(_x), y(_y), pressure(_p), thickness(_th) {}
};

struct BezierQuadSegment {
    Point2D p0;
    Point2D p1; // Control point
    Point2D p2;
    double startThick;
    double midThick;
    double endThick;
};

struct StrokeResult {
    std::vector<BezierQuadSegment> segments;
    std::vector<Point2D> outlinePoints;
    double minX, minY, maxX, maxY;
    int strokeColor;
    float opacity;
    bool isVector;
    StrokeResult() : minX(0), minY(0), maxX(0), maxY(0), strokeColor(0xFF000000), opacity(1.0f), isVector(true) {}
};

class StrokeEngine {
public:
    StrokeEngine();
    ~StrokeEngine();

    void beginStroke(double x, double y, double pressure, double baseSize, uint32_t color, float opacity, bool isVector, double smoothError);
    void addPoint(double x, double y, double pressure);
    StrokeResult endStroke();

    void setSmoothError(double error);
    void setBrushSize(double size);
    void setColor(uint32_t color);

    static std::string getCommitSha();
    static std::string getLicenseNotice();

private:
    // Actual Upstream OpenToonz StrokeGenerator
    StrokeGenerator m_strokeGenerator;
    double m_baseSize;
    uint32_t m_color;
    float m_opacity;
    bool m_isVector;
    double m_smoothError;
    bool m_inStroke;

    double computeThickness(double pressure) const {
        double p = pressure > 0.0 ? pressure : 0.5;
        return m_baseSize * (0.2 + 0.8 * p);
    }
};

} // namespace OpenToonzEngine

#endif // OPENTOONZ_ENGINE_CORE_H

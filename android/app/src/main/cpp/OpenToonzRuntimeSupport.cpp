#include "tgeometry.h"
#include "tgl.h"
#include <GL/glu.h>

double tglGetPixelSize2() {
    return 1.0;
}

// Exact OpenToonz tglDrawDisk implementation, isolated from the desktop
// TGL translation unit so Android does not pull in unrelated raster/image
// renderer dependencies.
void tglDrawDisk(const TPointD &c, double r) {
    if (r <= 0) return;

    double pixelSize = 1;
    int slices       = 60;

    if (slices <= 0) slices = 1;

    glPushMatrix();
    glTranslated(c.x, c.y, 0.0);
    GLUquadric *quadric = gluNewQuadric();
    gluDisk(quadric, 0, r, slices, 1);
    gluDeleteQuadric(quadric);
    glPopMatrix();
}

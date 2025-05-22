import * as THREE from "three";

export class FilterModels {
  /**
   * Create 3D Glasses Model with better proportions for face alignment
   */
  static createGlasses(): THREE.Group {
    const glassesGroup = new THREE.Group();

    // Materials
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 30,
    });
    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      shininess: 100,
    });

    // Smaller, more realistic proportions
    const lensRadius = 0.08;
    const frameThickness = 0.008;
    const bridgeWidth = 0.04;
    const templeLength = 0.15;
    const lensDistance = 0.14; // Distance between lens centers

    // Left lens frame
    const leftFrameGeometry = new THREE.TorusGeometry(
      lensRadius,
      frameThickness,
      8,
      20
    );
    const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
    leftFrame.position.set(-lensDistance / 2, 0, 0);

    // Right lens frame
    const rightFrame = leftFrame.clone();
    rightFrame.position.set(lensDistance / 2, 0, 0);

    // Left lens
    const lensGeometry = new THREE.CircleGeometry(lensRadius * 0.9, 32);
    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.position.set(-lensDistance / 2, 0, 0.001);

    // Right lens
    const rightLens = leftLens.clone();
    rightLens.position.set(lensDistance / 2, 0, 0.001);

    // Bridge (connecting the two frames)
    const bridgeGeometry = new THREE.CylinderGeometry(
      frameThickness,
      frameThickness,
      bridgeWidth,
      8
    );
    const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0, 0);

    // Left temple (arm)
    const templeGeometry = new THREE.CylinderGeometry(
      frameThickness * 0.8,
      frameThickness * 0.8,
      templeLength,
      8
    );
    const leftTemple = new THREE.Mesh(templeGeometry, frameMaterial);
    leftTemple.rotation.z = Math.PI / 2;
    leftTemple.rotation.y = -0.2; // Angle backwards
    leftTemple.position.set(-lensDistance / 2 - lensRadius, 0, -0.05);

    // Right temple
    const rightTemple = leftTemple.clone();
    rightTemple.rotation.y = 0.2; // Angle backwards
    rightTemple.position.set(lensDistance / 2 + lensRadius, 0, -0.05);

    glassesGroup.add(
      leftFrame,
      rightFrame,
      leftLens,
      rightLens,
      bridge,
      leftTemple,
      rightTemple
    );

    return glassesGroup;
  }

  /**
   * Create 3D Hat Model with better proportions
   */
  static createHat(): THREE.Group {
    const hatGroup = new THREE.Group();

    // Materials
    const hatMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const brimMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const bandMaterial = new THREE.MeshPhongMaterial({ color: 0x2c1810 });

    // Better proportions for face fitting
    const crownRadius = 0.1;
    const crownHeight = 0.12;
    const brimRadius = 0.16;

    // Hat crown (main body)
    const crownGeometry = new THREE.CylinderGeometry(
      crownRadius * 0.9,
      crownRadius,
      crownHeight,
      16
    );
    const crown = new THREE.Mesh(crownGeometry, hatMaterial);
    crown.position.set(0, crownHeight / 2, 0);

    // Hat top (rounded)
    const topGeometry = new THREE.SphereGeometry(
      crownRadius * 0.9,
      16,
      8,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const top = new THREE.Mesh(topGeometry, hatMaterial);
    top.position.set(0, crownHeight, 0);

    // Hat brim
    const brimGeometry = new THREE.RingGeometry(
      crownRadius + 0.01,
      brimRadius,
      32
    );
    const brim = new THREE.Mesh(brimGeometry, brimMaterial);
    brim.rotation.x = -Math.PI / 2;
    brim.position.set(0, 0, 0);

    // Hat band
    const bandGeometry = new THREE.CylinderGeometry(
      crownRadius + 0.005,
      crownRadius + 0.005,
      0.02,
      16
    );
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.position.set(0, 0.02, 0);

    // Small decorative element
    const decorGeometry = new THREE.SphereGeometry(0.01, 8, 8);
    const decorMaterial = new THREE.MeshPhongMaterial({ color: 0xdc143c });
    const decoration = new THREE.Mesh(decorGeometry, decorMaterial);
    decoration.position.set(crownRadius * 0.8, crownHeight * 0.3, 0);

    hatGroup.add(crown, top, brim, band, decoration);

    return hatGroup;
  }

  /**
   * Create 3D Beard Model with better structure
   */
  static createBeard(): THREE.Group {
    const beardGroup = new THREE.Group();

    const beardMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a3728,
      shininess: 5,
    });

    // Main beard shape - more proportional
    const mainBeardGeometry = new THREE.SphereGeometry(0.1, 16, 12);
    mainBeardGeometry.scale(1.3, 1.2, 0.6); // Wider, taller, less deep
    const mainBeard = new THREE.Mesh(mainBeardGeometry, beardMaterial);
    mainBeard.position.set(0, -0.05, 0.02);

    // Upper beard section (connects to jawline)
    const upperBeardGeometry = new THREE.SphereGeometry(0.08, 12, 10);
    upperBeardGeometry.scale(1.4, 0.6, 0.5);
    const upperBeard = new THREE.Mesh(upperBeardGeometry, beardMaterial);
    upperBeard.position.set(0, 0.01, 0.02);

    // Side beard sections
    const sideBeardGeometry = new THREE.SphereGeometry(0.06, 10, 8);
    const leftSideBeard = new THREE.Mesh(sideBeardGeometry, beardMaterial);
    leftSideBeard.position.set(-0.08, -0.01, 0.015);
    leftSideBeard.scale.set(0.7, 1.0, 0.6);

    const rightSideBeard = leftSideBeard.clone();
    rightSideBeard.position.set(0.08, -0.01, 0.015);

    beardGroup.add(mainBeard, upperBeard, leftSideBeard, rightSideBeard);

    return beardGroup;
  }

  /**
   * Create 3D Mustache Model with better curve
   */
  static createMustache(): THREE.Group {
    const mustacheGroup = new THREE.Group();

    const mustacheMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c1810,
      shininess: 15,
    });

    // Create curved mustache using multiple segments
    const segments = 6;
    const mustacheWidth = 0.12;

    for (let i = 0; i < segments; i++) {
      const t = (i / (segments - 1)) * 2 - 1; // -1 to 1

      // Create curved shape
      const x = (t * mustacheWidth) / 2;
      const y = -Math.abs(t) * 0.015; // Dip in the center
      const z = 0.01;

      // Size varies along the mustache
      const scale = 0.6 + Math.abs(t) * 0.3; // Thicker at the ends

      const segmentGeometry = new THREE.SphereGeometry(0.015, 8, 6);
      segmentGeometry.scale(1.2 * scale, 0.5, 0.6);
      const segment = new THREE.Mesh(segmentGeometry, mustacheMaterial);

      segment.position.set(x, y, z);
      segment.rotation.z = t * 0.2; // Slight rotation for natural curve

      mustacheGroup.add(segment);
    }

    // Add distinctive mustache tips
    const tipGeometry = new THREE.SphereGeometry(0.01, 8, 6);
    tipGeometry.scale(1.5, 0.3, 0.5);

    const leftTip = new THREE.Mesh(tipGeometry, mustacheMaterial);
    leftTip.position.set(-mustacheWidth / 2 - 0.015, -0.005, 0.01);
    leftTip.rotation.z = 0.3;

    const rightTip = new THREE.Mesh(tipGeometry, mustacheMaterial);
    rightTip.position.set(mustacheWidth / 2 + 0.015, -0.005, 0.01);
    rightTip.rotation.z = -0.3;

    mustacheGroup.add(leftTip, rightTip);

    return mustacheGroup;
  }

  /**
   * Create optimized lighting setup for face filters
   */
  static createLighting(): THREE.Light[] {
    const lights: THREE.Light[] = [];

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    lights.push(ambientLight);

    // Key light (main directional light from top-front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(0, 1, 1);
    keyLight.castShadow = false; // Disable shadows for performance
    lights.push(keyLight);

    // Fill light (softer, from the side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-0.5, 0.5, 0.5);
    lights.push(fillLight);

    return lights;
  }
}

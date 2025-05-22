import * as THREE from "three";

export class FilterModels {
  /**
   * Create 3D Glasses Model with better proportions
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
      opacity: 0.2,
      shininess: 100,
    });

    // Improved proportions for better face fitting
    const lensRadius = 0.12;
    const frameThickness = 0.012;
    const bridgeWidth = 0.06;
    const templeLength = 0.2;

    // Left lens frame
    const leftFrameGeometry = new THREE.TorusGeometry(
      lensRadius,
      frameThickness,
      8,
      20
    );
    const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
    leftFrame.position.set(-lensRadius * 0.9, 0, 0);

    // Right lens frame
    const rightFrame = leftFrame.clone();
    rightFrame.position.set(lensRadius * 0.9, 0, 0);

    // Left lens
    const lensGeometry = new THREE.CircleGeometry(lensRadius * 0.95, 32);
    const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
    leftLens.position.set(-lensRadius * 0.9, 0, 0.002);

    // Right lens
    const rightLens = leftLens.clone();
    rightLens.position.set(lensRadius * 0.9, 0, 0.002);

    // Bridge (connecting the two frames)
    const bridgeGeometry = new THREE.CylinderGeometry(
      frameThickness * 0.8,
      frameThickness * 0.8,
      bridgeWidth,
      8
    );
    const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0, 0);

    // Left temple (arm)
    const templeGeometry = new THREE.CylinderGeometry(
      frameThickness * 0.7,
      frameThickness * 0.7,
      templeLength,
      8
    );
    const leftTemple = new THREE.Mesh(templeGeometry, frameMaterial);
    leftTemple.rotation.z = Math.PI / 2;
    leftTemple.position.set(-lensRadius * 1.6, 0, -0.08);

    // Right temple
    const rightTemple = leftTemple.clone();
    rightTemple.position.set(lensRadius * 1.6, 0, -0.08);

    glassesGroup.add(
      leftFrame,
      rightFrame,
      leftLens,
      rightLens,
      bridge,
      leftTemple,
      rightTemple
    );

    // Adjust overall orientation for better fitting
    glassesGroup.rotation.x = 0.1; // Slight downward tilt

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

    // Better proportions
    const crownRadius = 0.14;
    const crownHeight = 0.18;
    const brimRadius = 0.22;

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
    const brimGeometry = new THREE.CylinderGeometry(
      brimRadius,
      brimRadius,
      0.02,
      32
    );
    const brimHole = new THREE.CylinderGeometry(
      crownRadius + 0.01,
      crownRadius + 0.01,
      0.03,
      32
    );

    // Create brim with hole (simplified approach)
    const brim = new THREE.Mesh(brimGeometry, brimMaterial);
    brim.position.set(0, 0, 0);

    // Hat band
    const bandGeometry = new THREE.CylinderGeometry(
      crownRadius + 0.01,
      crownRadius + 0.01,
      0.03,
      16
    );
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.position.set(0, 0.04, 0);

    // Add a decorative feather or ornament
    const featherGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const featherMaterial = new THREE.MeshPhongMaterial({ color: 0xdc143c });
    const feather = new THREE.Mesh(featherGeometry, featherMaterial);
    feather.position.set(crownRadius * 0.7, crownHeight * 0.3, 0);

    hatGroup.add(crown, top, brim, band, feather);

    // Position hat properly above head
    hatGroup.position.y = 0.1;

    return hatGroup;
  }

  /**
   * Create 3D Beard Model with better structure
   */
  static createBeard(): THREE.Group {
    const beardGroup = new THREE.Group();

    const beardMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b4513,
      shininess: 10,
    });

    // Main beard shape (more realistic proportions)
    const mainBeardGeometry = new THREE.SphereGeometry(0.16, 16, 12);
    mainBeardGeometry.scale(1.2, 1.4, 0.8); // Wider, taller, less deep
    const mainBeard = new THREE.Mesh(mainBeardGeometry, beardMaterial);
    mainBeard.position.set(0, -0.08, 0.04);

    // Upper beard section (connects to face)
    const upperBeardGeometry = new THREE.SphereGeometry(0.12, 12, 10);
    upperBeardGeometry.scale(1.3, 0.8, 0.6);
    const upperBeard = new THREE.Mesh(upperBeardGeometry, beardMaterial);
    upperBeard.position.set(0, 0.02, 0.03);

    // Side beard sections
    const sideBeardGeometry = new THREE.SphereGeometry(0.08, 10, 8);
    const leftSideBeard = new THREE.Mesh(sideBeardGeometry, beardMaterial);
    leftSideBeard.position.set(-0.12, -0.02, 0.02);
    leftSideBeard.scale.set(0.8, 1.2, 0.7);

    const rightSideBeard = leftSideBeard.clone();
    rightSideBeard.position.set(0.12, -0.02, 0.02);

    // Add texture with smaller hair clumps
    for (let i = 0; i < 30; i++) {
      const strandGeometry = new THREE.SphereGeometry(0.012, 6, 6);
      const strand = new THREE.Mesh(strandGeometry, beardMaterial);

      // Distribute around the beard
      const angle = (i / 30) * Math.PI * 2;
      const radius = 0.12 + Math.random() * 0.04;
      const height = -0.15 + Math.random() * 0.12;

      strand.position.set(
        Math.cos(angle) * radius,
        height,
        0.03 + Math.sin(angle) * 0.02
      );

      beardGroup.add(strand);
    }

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
    const segments = 8;
    const mustacheWidth = 0.16;

    for (let i = 0; i < segments; i++) {
      const t = (i / (segments - 1)) * 2 - 1; // -1 to 1

      // Create curved shape
      const x = (t * mustacheWidth) / 2;
      const y = -Math.abs(t) * 0.02; // Dip in the center
      const z = 0.02;

      // Size varies along the mustache
      const scale = 0.8 + Math.abs(t) * 0.4; // Thicker at the ends

      const segmentGeometry = new THREE.SphereGeometry(0.02, 8, 6);
      segmentGeometry.scale(1.5 * scale, 0.6, 0.8);
      const segment = new THREE.Mesh(segmentGeometry, mustacheMaterial);

      segment.position.set(x, y, z);
      segment.rotation.z = t * 0.3; // Slight rotation for natural curve

      mustacheGroup.add(segment);
    }

    // Add distinctive mustache tips
    const tipGeometry = new THREE.SphereGeometry(0.015, 8, 6);
    tipGeometry.scale(2, 0.4, 0.6);

    const leftTip = new THREE.Mesh(tipGeometry, mustacheMaterial);
    leftTip.position.set(-mustacheWidth / 2 - 0.02, -0.01, 0.02);
    leftTip.rotation.z = 0.5;

    const rightTip = new THREE.Mesh(tipGeometry, mustacheMaterial);
    rightTip.position.set(mustacheWidth / 2 + 0.02, -0.01, 0.02);
    rightTip.rotation.z = -0.5;

    mustacheGroup.add(leftTip, rightTip);

    return mustacheGroup;
  }

  /**
   * Create optimized lighting setup
   */
  static createLighting(): THREE.Light[] {
    const lights: THREE.Light[] = [];

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    lights.push(ambientLight);

    // Key light (main directional light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(0.5, 1, 1);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    lights.push(keyLight);

    // Fill light (softer, from the other side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-0.5, 0.5, 0.5);
    lights.push(fillLight);

    // Rim light (for edge highlighting)
    const rimLight = new THREE.PointLight(0xffffff, 0.2);
    rimLight.position.set(0, 0, -1);
    lights.push(rimLight);

    return lights;
  }
}

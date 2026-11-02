"""Render editorial assets for the Home page.

Usage: blender -b -P render.py -- <mode> <out_dir> [frames]
modes: test | cover | macro | still
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
MODE = argv[0]
OUT = argv[1]
FRAMES = int(argv[2]) if len(argv) > 2 else 24
os.makedirs(OUT, exist_ok=True)


def srgb(hex_str, alpha=1.0):
    h = hex_str.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, alpha)


ORANGE = "#FF5A1F"
COBALT = "#2340C8"
PAPER = "#ECEEF1"


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 96
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.adaptive_threshold = 0.02
    scene.cycles.use_denoising = True
    scene.render.threads_mode = "AUTO"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    return scene


def new_material(name, color, roughness=0.32, layers=True, coat=0.25):
    mat = bpy.data.materials.new(name)
    try:
        mat.use_nodes = True
    except Exception:
        pass
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = srgb(color)
    bsdf.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.25
    if "Sheen Weight" in bsdf.inputs:
        bsdf.inputs["Sheen Weight"].default_value = 0.15
    if layers:
        # Linhas de camada reais: seno na altura do objeto vira relevo
        coord = nodes.new("ShaderNodeTexCoord")
        sep = nodes.new("ShaderNodeSeparateXYZ")
        mul = nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = 2 * math.pi / 0.0007  # camada exagerada para aparecer na foto
        sine = nodes.new("ShaderNodeMath")
        sine.operation = "SINE"
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.55
        bump.inputs["Distance"].default_value = 0.00012
        links.new(coord.outputs["Object"], sep.inputs[0])
        links.new(sep.outputs["Z"], mul.inputs[0])
        links.new(mul.outputs[0], sine.inputs[0])
        links.new(sine.outputs[0], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def make_vase(name="Vaso", height=0.2, color=ORANGE):
    radial, rings = 220, 260
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    grid = []
    for i in range(rings + 1):
        v = i / rings
        profile = 0.36 + 0.26 * math.sin(math.pi * (v * 0.95 + 0.05)) + 0.08 * v ** 6
        twist = v * math.pi * 0.8
        ring = []
        for j in range(radial):
            a = j / radial * 2 * math.pi
            r = profile * (1 + 0.09 * math.cos(6 * (a - twist))) * height / 1.9
            ring.append(bm.verts.new((math.cos(a) * r, math.sin(a) * r, v * height)))
        grid.append(ring)
    for i in range(rings):
        for j in range(radial):
            k = (j + 1) % radial
            bm.faces.new((grid[i][j], grid[i][k], grid[i + 1][k], grid[i + 1][j]))
    bm.faces.new(list(reversed(grid[0])))
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    solid = obj.modifiers.new("Parede", "SOLIDIFY")
    solid.thickness = 0.0016
    solid.offset = -1
    obj.data.materials.append(new_material(name + "Mat", color))
    return obj


def make_knot(color, scale=0.05):
    curve = bpy.data.curves.new("Knot", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = 0.32 * scale
    curve.bevel_resolution = 10
    curve.resolution_u = 4
    spline = curve.splines.new("NURBS")
    n = 240
    spline.points.add(n - 1)
    for i in range(n):
        t = i / n * 2 * math.pi
        r = 1 + 0.45 * math.cos(3 * t)
        spline.points[i].co = (r * math.cos(2 * t) * scale, r * math.sin(2 * t) * scale, 0.45 * math.sin(3 * t) * scale, 1)
    spline.use_cyclic_u = True
    spline.order_u = 4
    obj = bpy.data.objects.new("Knot", curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(new_material("KnotMat", color, roughness=0.4))
    return obj


def make_keychain(color, label="SINOP"):
    bpy.ops.mesh.primitive_cube_add(size=1)
    plate = bpy.context.object
    plate.scale = (0.075, 0.03, 0.0035)
    bpy.ops.object.transform_apply(scale=True)
    bev = plate.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.008
    bev.segments = 8
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0055, depth=0.05, location=(-0.026, 0, 0))
    hole = bpy.context.object
    boolean = plate.modifiers.new("Furo", "BOOLEAN")
    boolean.object = hole
    boolean.operation = "DIFFERENCE"
    hole.hide_render = True
    hole.hide_viewport = True
    plate.data.materials.append(new_material("PlateMat", color, roughness=0.45))

    text_curve = bpy.data.curves.new("Label", "FONT")
    text_curve.body = label
    text_curve.size = 0.017
    text_curve.extrude = 0.0012
    text_curve.align_x = "CENTER"
    text_curve.align_y = "CENTER"
    text = bpy.data.objects.new("Label", text_curve)
    bpy.context.collection.objects.link(text)
    text.location = (0.008, 0, 0.0035)
    text.data.materials.append(new_material("LabelMat", PAPER, roughness=0.5, layers=False))
    text.parent = plate

    bpy.ops.mesh.primitive_torus_add(major_radius=0.011, minor_radius=0.0013, location=(-0.026 - 0.009, 0, 0.004))
    ring = bpy.context.object
    ring.rotation_euler = (math.radians(70), 0, 0)
    metal = bpy.data.materials.new("Metal")
    try:
        metal.use_nodes = True
    except Exception:
        pass
    b = metal.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = srgb("#C9CDD4")
    b.inputs["Metallic"].default_value = 1
    b.inputs["Roughness"].default_value = 0.22
    ring.data.materials.append(metal)
    ring.parent = plate
    return plate


def add_area(name, loc, target, size, power, color="#FFFFFF"):
    data = bpy.data.lights.new(name, "AREA")
    data.size = size
    data.energy = power
    data.color = srgb(color)[:3]
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    direction = Vector(target) - Vector(loc)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return obj


def add_camera(loc, target, lens=85, fstop=None, focus=None):
    data = bpy.data.cameras.new("Cam")
    data.lens = lens
    if fstop:
        data.dof.use_dof = True
        data.dof.aperture_fstop = fstop
        data.dof.focus_distance = focus
    cam = bpy.data.objects.new("Cam", data)
    bpy.context.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


def world(color, strength):
    w = bpy.data.worlds.new("World")
    try:
        w.use_nodes = True
    except Exception:
        pass
    bg = w.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = srgb(color)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def shadow_floor(size=3):
    bpy.ops.mesh.primitive_plane_add(size=size)
    floor = bpy.context.object
    floor.is_shadow_catcher = True
    return floor


def studio_lights(scale=1.0):
    add_area("Key", (-0.6 * scale, -0.3 * scale, 0.5 * scale), (0, 0, 0.1 * scale), 0.5 * scale, 11 * scale ** 2)
    add_area("Rim", (0.5 * scale, 0.45 * scale, 0.35 * scale), (0, 0, 0.12 * scale), 0.3 * scale, 7 * scale ** 2, "#DCE3FF")
    add_area("Fill", (0.6 * scale, -0.5 * scale, 0.15 * scale), (0, 0, 0.1 * scale), 0.8 * scale, 1.6 * scale ** 2)


def set_output(w, h, fmt="WEBP", transparent=True, quality=86):
    scene = bpy.context.scene
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = fmt
    scene.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    if fmt == "WEBP":
        scene.render.image_settings.quality = quality


def render_to(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


if MODE in ("test", "cover"):
    reset()
    vase = make_vase()
    shadow_floor()
    studio_lights()
    world(COBALT, 0.35)
    add_camera((0, -0.76, 0.3), (0, 0, 0.092), lens=85)
    set_output(900, 1200)
    if MODE == "test":
        bpy.context.scene.cycles.samples = 32
        render_to(os.path.join(OUT, "test.webp"))
    else:
        bpy.context.scene.cycles.samples = 32
        # O vaso tem simetria de 6 lobos: 60 graus fecham o loop
        for f in range(FRAMES):
            vase.rotation_euler.z = f / FRAMES * math.pi / 3
            render_to(os.path.join(OUT, f"vaso-{f:02d}.webp"))

elif MODE == "macro":
    reset()
    make_vase()
    world(PAPER, 0.6)
    bpy.ops.mesh.primitive_plane_add(size=3)
    floor = bpy.context.object
    floor.data.materials.append(new_material("Floor", PAPER, roughness=0.8, layers=False, coat=0))
    add_area("Key", (-0.35, -0.3, 0.3), (0, -0.06, 0.13), 0.25, 3.5)
    add_area("Rim", (0.3, 0.15, 0.25), (0, -0.06, 0.13), 0.15, 2.5, "#DCE3FF")
    add_camera((0.05, -0.26, 0.17), (0, -0.06, 0.13), lens=100, fstop=4.0, focus=0.205)
    set_output(1400, 1000, transparent=False)
    render_to(os.path.join(OUT, "macro-camadas.webp"))

elif MODE == "still":
    reset()
    vase = make_vase(height=0.2, color=ORANGE)
    vase.location = (0.02, 0.06, 0)
    knot = make_knot(PAPER)
    knot.location = (-0.15, -0.02, 0.031)
    knot.rotation_euler = (math.radians(12), math.radians(-8), 0.4)
    key = make_keychain(COBALT)
    key.scale = (1.7, 1.7, 1.7)
    key.location = (0.15, -0.1, 0.006)
    key.rotation_euler = (0, 0, math.radians(-18))
    shadow_floor()
    studio_lights(1.15)
    world("#3A3F4A", 0.3)
    add_camera((0, -1.05, 0.42), (0, 0, 0.07), lens=60)
    set_output(1600, 1000)
    bpy.context.scene.cycles.samples = 64
    render_to(os.path.join(OUT, "natureza-morta.webp"))

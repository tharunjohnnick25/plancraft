"""
Layout Optimizer - Places rooms, doors, windows in optimal positions.
"""
import math


class LayoutOptimizer:
    def optimize(self, rooms: list[dict], inputs: dict) -> list[dict]:
        plot_w = inputs.get("plot_width", 40)
        plot_l = inputs.get("plot_length", 60)
        facing = inputs.get("facing", "East")
        variation = inputs.get("variation_type", "space_optimized")

        # Grid-based placement
        grid_rows = 3
        grid_cols = 2
        row_h = plot_l / grid_rows
        col_w = plot_w / grid_cols

        vastu_map = {
            "master_bedroom": (2, 0),  # SW
            "kitchen": (2, 1),         # SE
            "living_room": (1, 0),     # West/Center
            "dining_room": (1, 1),     # East/Center
            "pooja_room": (0, 1),      # NE
            "bedroom": [(0, 0), (2, 1), (1, 0)],  # NW, SE, West
            "bathroom": (0, 0),        # NW
            "parking": (0, 0),         # NW
            "garden": (0, 0),          # North
        }

        bedroom_idx = 0
        bathroom_idx = 0
        parking_idx = 0

        for room in rooms:
            rid = room["id"]
            rtype = room["type"]

            if rtype == "bedroom":
                if "master" in rid:
                    pos = vastu_map["master_bedroom"]
                else:
                    beds = vastu_map["bedroom"]
                    pos = beds[bedroom_idx % len(beds)]
                    bedroom_idx += 1
            elif rtype == "kitchen":
                pos = vastu_map["kitchen"]
            elif rtype == "living":
                pos = vastu_map["living_room"]
            elif rtype == "dining":
                pos = vastu_map["dining_room"]
            elif rtype == "pooja":
                pos = vastu_map["pooja_room"]
            elif rtype == "bathroom":
                pos = vastu_map["bathroom"]
            elif rtype == "parking":
                pos = vastu_map["parking"]
            elif rtype == "garden":
                pos = vastu_map["garden"]
            else:
                pos = (1, 1)

            rx = pos[1] * col_w
            ry = pos[0] * row_h

            # Add spacing
            room["x"] = round(rx + 1, 1)
            room["y"] = round(ry + 1, 1)

            # Clamp sizes to grid cell
            room["width"] = min(room["width"], col_w - 2)
            room["length"] = min(room["length"], row_h - 2)
            room["area"] = round(room["width"] * room["length"], 1)

        # Apply facing rotation logic
        if facing in ["South", "West"]:
            for room in rooms:
                if room["type"] not in ("bathroom", "parking"):
                    room["x"] = plot_w - room["x"] - room["width"]

        return rooms

    def create_layout(self, rooms: list[dict], inputs: dict) -> dict:
        return {
            "rooms": rooms,
            "plot_width": inputs.get("plot_width", 40),
            "plot_length": inputs.get("plot_length", 60),
        }

    def place_doors(self, layout: dict) -> list[dict]:
        doors = []
        for room in layout["rooms"]:
            door = {
                "room_id": room["id"],
                "wall": "South" if room["y"] < layout["plot_length"] / 2 else "North",
                "position": round(room["width"] / 2, 1),
                "width": 3.0,
                "height": 7.0,
            }
            doors.append(door)
        return doors

    def place_windows(self, layout: dict, facing: str) -> list[dict]:
        windows = []
        for room in layout["rooms"]:
            preferred_wall = "East" if room["x"] < layout["plot_width"] / 2 else "West"
            if facing in ["East", "North"]:
                preferred_wall = "East" if room["x"] < layout["plot_width"] * 0.6 else "West"
            window = {
                "room_id": room["id"],
                "wall": preferred_wall,
                "position": round(room["length"] / 2, 1),
                "width": 4.0,
                "height": 4.0,
                "type": "sliding",
            }
            windows.append(window)
        return windows

#!/usr/bin/env python3
"""
Generate professional architecture diagrams for QuoteProgram
Using PIL (Python Imaging Library) for vector-like diagram creation
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
OUTPUT_DIR = "docs/assets"
DIAGRAMS = {
    "system-architecture": {
        "width": 1400,
        "height": 1000,
        "title": "QuoteProgram - System Architecture"
    },
    "data-flow": {
        "width": 1400,
        "height": 900,
        "title": "QuoteProgram - Data Flow"
    },
    "database-schema": {
        "width": 1600,
        "height": 1000,
        "title": "QuoteProgram - Database Schema"
    },
    "module-dependencies": {
        "width": 1400,
        "height": 1100,
        "title": "QuoteProgram - Module Dependencies"
    }
}

# Colors
COLOR_LAYER1 = (100, 150, 200)  # Blue
COLOR_LAYER2 = (150, 200, 100)  # Green
COLOR_LAYER3 = (200, 150, 100)  # Orange
COLOR_BG = (245, 245, 245)      # Light gray
COLOR_TEXT = (30, 30, 30)       # Dark gray
COLOR_BORDER = (80, 80, 80)     # Dark border
COLOR_WHITE = (255, 255, 255)   # White
COLOR_RED = (220, 100, 100)     # Red for critical

def draw_box(draw, x, y, width, height, text, color, text_color=COLOR_TEXT, font_size=12):
    """Draw a rounded rectangle box with text"""
    # Draw rectangle
    draw.rectangle([x, y, x + width, y + height], fill=color, outline=COLOR_BORDER, width=2)

    # Draw text (simplified - PIL doesn't have easy rounded rectangles)
    text_y = y + (height - font_size) // 2
    draw.text((x + 10, text_y), text, fill=text_color, font=None)

def draw_arrow(draw, x1, y1, x2, y2, color=COLOR_BORDER):
    """Draw an arrow between two points"""
    draw.line([x1, y1, x2, y2], fill=color, width=2)
    # Draw arrowhead
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_size = 10
    x_arrow = x2 - arrow_size * math.cos(angle)
    y_arrow = y2 - arrow_size * math.sin(angle)
    draw.polygon([
        (x2, y2),
        (x_arrow - arrow_size * math.sin(angle), y_arrow + arrow_size * math.cos(angle)),
        (x_arrow + arrow_size * math.sin(angle), y_arrow - arrow_size * math.cos(angle))
    ], fill=color)

def create_system_architecture():
    """Create system architecture diagram"""
    img = Image.new('RGB', (DIAGRAMS["system-architecture"]["width"],
                           DIAGRAMS["system-architecture"]["height"]), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Title
    draw.text((50, 20), DIAGRAMS["system-architecture"]["title"], fill=COLOR_TEXT)

    # Layer 1: UI Layer
    y = 80
    draw.text((50, y), "PRESENTATION LAYER (VCL Forms)", fill=COLOR_TEXT)
    y += 40

    boxes = [
        (50, y, 280, 80, "QuoteList.pas\n(Search/Browse)"),
        (360, y, 280, 80, "QuoteEdit.pas\n(Multi-tab Editor)"),
        (670, y, 280, 80, "ItemEntry.pas\n(Item Dialog)"),
        (980, y, 280, 80, "50+ Supporting\nForms"),
    ]

    for x, y_pos, w, h, text in boxes:
        draw.rectangle([x, y_pos, x + w, y_pos + h], fill=COLOR_LAYER1, outline=COLOR_BORDER, width=2)
        draw.text((x + 10, y_pos + 20), text, fill=COLOR_WHITE)

    # Arrows down
    for x, _, w, _, _ in boxes:
        draw_arrow(draw, x + w//2, y + 80, x + w//2, y + 140)

    # Layer 2: Data Module
    y = 220
    draw.text((50, y), "DATA ACCESS LAYER (Borland Database Engine)", fill=COLOR_TEXT)
    y += 40

    draw.rectangle([50, y, 1250, y + 120], fill=COLOR_LAYER2, outline=COLOR_BORDER, width=2)
    draw.text((70, y + 20), "ESS_Data.pas (TDataModule)", fill=COLOR_WHITE)
    draw.text((70, y + 50), "• 15 Tables  • 5+ DataSources  • 2 Queries  • Database Connection", fill=COLOR_WHITE)

    # Arrows down
    for x in [200, 500, 800, 1100]:
        draw_arrow(draw, x, y + 120, x, y + 180)

    # Layer 3: Database
    y = 380
    draw.text((50, y), "DATABASE LAYER (Paradox Files)", fill=COLOR_TEXT)
    y += 40

    db_boxes = [
        (50, y, 280, 100, "Quotes Table\n(Quote Header)"),
        (360, y, 280, 100, "Items Table\n(Line Items)"),
        (670, y, 280, 100, "Customer Table\n(Customer Lookup)"),
        (980, y, 280, 100, "Products Table\n(Pricing)"),
    ]

    for x, y_pos, w, h, text in db_boxes:
        draw.rectangle([x, y_pos, x + w, y_pos + h], fill=COLOR_LAYER3, outline=COLOR_BORDER, width=2)
        draw.text((x + 10, y_pos + 25), text, fill=COLOR_WHITE)

    # External integration box
    draw.rectangle([50, 550, 1250, 650], fill=COLOR_RED, outline=COLOR_BORDER, width=2)
    draw.text((70, 570), "External Integration: SPRO API (Legacy hex-based protocol)", fill=COLOR_WHITE)
    draw.text((70, 600), "Parent System: Emjac Sales System (shared data references)", fill=COLOR_WHITE)

    img.save(os.path.join(OUTPUT_DIR, "system-architecture.png"))
    print("[OK] Created: system-architecture.png")

def create_data_flow():
    """Create data flow diagram"""
    img = Image.new('RGB', (DIAGRAMS["data-flow"]["width"],
                           DIAGRAMS["data-flow"]["height"]), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Title
    draw.text((50, 20), DIAGRAMS["data-flow"]["title"], fill=COLOR_TEXT)

    # Flow steps
    flows = [
        (100, 80, "User clicks\n'New Quote'"),
        (100, 200, "QuoteEdit form\nopens"),
        (100, 320, "User fills form\n& adds items"),
        (100, 440, "User clicks\n'Save'"),
        (100, 560, "Data validated\n& posted"),
        (100, 680, "Paradox database\nupdated"),
    ]

    for i, (x, y, text) in enumerate(flows):
        color = COLOR_LAYER1 if i % 2 == 0 else COLOR_LAYER2
        draw.rectangle([x, y, x + 200, y + 80], fill=color, outline=COLOR_BORDER, width=2)
        draw.text((x + 10, y + 20), text, fill=COLOR_WHITE)

        if i < len(flows) - 1:
            draw_arrow(draw, x + 100, y + 80, x + 100, flows[i+1][1])

    # Right side: Alternative flows
    draw.text((450, 80), "Alternative Flows", fill=COLOR_TEXT)

    alt_flows = [
        "Edit Existing Quote:\n  Select → Open → Modify → Save",
        "Print Quote:\n  QuotePrint → ReportSmith → Printer",
        "Copy Quote:\n  Select → Copy → New Number → Save",
        "Export Quote:\n  ExportQuote utility → CSV file",
    ]

    for i, text in enumerate(alt_flows):
        y = 120 + i * 160
        draw.rectangle([450, y, 1250, y + 140], fill=COLOR_LAYER3, outline=COLOR_BORDER, width=2)
        draw.text((470, y + 20), text, fill=COLOR_WHITE)

    img.save(os.path.join(OUTPUT_DIR, "data-flow.png"))
    print("[OK] Created: data-flow.png")

def create_database_schema():
    """Create database schema diagram"""
    img = Image.new('RGB', (DIAGRAMS["database-schema"]["width"],
                           DIAGRAMS["database-schema"]["height"]), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Title
    draw.text((50, 20), DIAGRAMS["database-schema"]["title"], fill=COLOR_TEXT)

    # Main tables
    tables = {
        "Quotes": {"x": 50, "y": 80, "fields": ["QuoteNum (PK)", "JobName", "CustNum (FK)", "QuoteDate", "SubTotal"]},
        "Items": {"x": 400, "y": 80, "fields": ["QuoteNum (FK)", "ItemID", "Material", "Finish", "Construction"]},
        "Customer": {"x": 750, "y": 80, "fields": ["CustNum (PK)", "Name", "Address", "City", "State"]},
        "Products": {"x": 1100, "y": 80, "fields": ["Type (PK)", "MinQty", "Price1", "Price2", "Price3"]},
    }

    for table_name, info in tables.items():
        x, y = info["x"], info["y"]
        draw.rectangle([x, y, x + 320, y + 180], fill=COLOR_LAYER1, outline=COLOR_BORDER, width=2)
        draw.text((x + 10, y + 10), table_name, fill=COLOR_WHITE)

        for i, field in enumerate(info["fields"]):
            draw.text((x + 10, y + 40 + i * 25), f"• {field}", fill=COLOR_WHITE)

    # Relationship indicators
    draw.text((50, 300), "Key Relationships:", fill=COLOR_TEXT)
    draw.text((50, 340), "Quotes.CustNum → Customer.CustNum", fill=COLOR_TEXT)
    draw.text((50, 370), "Items.QuoteNum → Quotes.QuoteNum", fill=COLOR_TEXT)

    # Additional tables section
    draw.text((50, 420), "Supporting Tables (Configuration):", fill=COLOR_TEXT)

    support_tables = [
        ("ItemType", 50, 460, ["Type (PK)", "Description"]),
        ("CostFact", 350, 460, ["Factor (PK)", "Percentage"]),
        ("ViaCode", 650, 460, ["Code (PK)", "Description"]),
        ("CommAcct", 950, 460, ["AcctNum (PK)", "Name"]),
        ("Stocking", 50, 620, ["ItemID (FK)", "Qty"]),
        ("Control", 350, 620, ["Metadata", "Values"]),
    ]

    for table_name, x, y, fields in support_tables:
        draw.rectangle([x, y, x + 280, y + 130], fill=COLOR_LAYER2, outline=COLOR_BORDER, width=2)
        draw.text((x + 10, y + 10), table_name, fill=COLOR_WHITE)
        for i, field in enumerate(fields):
            draw.text((x + 10, y + 40 + i * 25), f"• {field}", fill=COLOR_WHITE)

    img.save(os.path.join(OUTPUT_DIR, "database-schema.png"))
    print("[OK] Created: database-schema.png")

def create_module_dependencies():
    """Create module dependency diagram"""
    img = Image.new('RGB', (DIAGRAMS["module-dependencies"]["width"],
                           DIAGRAMS["module-dependencies"]["height"]), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Title
    draw.text((50, 20), DIAGRAMS["module-dependencies"]["title"], fill=COLOR_TEXT)

    # Main entry point
    draw.rectangle([550, 40, 850, 120], fill=COLOR_RED, outline=COLOR_BORDER, width=3)
    draw.text((580, 65), "FabricationQuotes.dpr", fill=COLOR_WHITE)
    draw.text((560, 85), "(Main Executable)", fill=COLOR_WHITE)

    # Primary modules
    primary_modules = [
        ("QuoteList.pas\n(Main UI)", 50, 200, COLOR_LAYER1),
        ("QuoteEdit.pas\n(Editor)", 350, 200, COLOR_LAYER1),
        ("ItemEntry.pas\n(Dialog)", 650, 200, COLOR_LAYER1),
        ("QuotePrint.pas\n(Reporting)", 950, 200, COLOR_LAYER1),
    ]

    for i, (text, x, y, color) in enumerate(primary_modules):
        draw.rectangle([x, y, x + 280, y + 100], fill=color, outline=COLOR_BORDER, width=2)
        draw.text((x + 20, y + 30), text, fill=COLOR_WHITE)
        draw_arrow(draw, 700, 120, x + 140, y)

    # Central data module (critical)
    draw.rectangle([400, 400, 900, 480], fill=COLOR_RED, outline=COLOR_BORDER, width=3)
    draw.text((470, 420), "ESS_Data.pas (CRITICAL HUB)", fill=COLOR_WHITE)
    draw.text((420, 450), "All forms depend on this module for database access", fill=COLOR_WHITE)

    # Arrows from primary modules to data module
    for _, x, y, _ in primary_modules:
        draw_arrow(draw, x + 140, y + 100, 650, 400)

    # Supporting modules
    support = [
        ("Maintenance\nForms", 50, 600, COLOR_LAYER2),
        ("Reports\nModule", 350, 600, COLOR_LAYER2),
        ("Sales Orders\nModule", 650, 600, COLOR_LAYER2),
        ("Utilities\n(Copy, Export)", 950, 600, COLOR_LAYER2),
    ]

    for text, x, y, color in support:
        draw.rectangle([x, y, x + 280, y + 100], fill=color, outline=COLOR_BORDER, width=2)
        draw.text((x + 30, y + 30), text, fill=COLOR_WHITE)
        draw_arrow(draw, x + 140, y, 650, 480)

    # Database layer at bottom
    draw.rectangle([300, 800, 1100, 880], fill=COLOR_LAYER3, outline=COLOR_BORDER, width=2)
    draw.text((450, 820), "Paradox Database (30+ files)", fill=COLOR_WHITE)
    draw.text((300, 850), "Doors variant  |  Fab variant", fill=COLOR_WHITE)

    draw_arrow(draw, 650, 480, 650, 800)

    img.save(os.path.join(OUTPUT_DIR, "module-dependencies.png"))
    print("[OK] Created: module-dependencies.png")

def main():
    """Generate all diagrams"""
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Generating QuoteProgram Architecture Diagrams...\n")

    create_system_architecture()
    create_data_flow()
    create_database_schema()
    create_module_dependencies()

    print(f"\n[SUCCESS] All diagrams created in: {OUTPUT_DIR}/")
    print(f"\nGenerated files:")
    print(f"  • system-architecture.png")
    print(f"  • data-flow.png")
    print(f"  • database-schema.png")
    print(f"  • module-dependencies.png")

if __name__ == "__main__":
    main()

# QuoteProgram - Legacy Delphi System Analysis

**Status:** Legacy System
**Technology:** Delphi 7+ (VCL Framework)
**Purpose:** Desktop-based quote generation system for manufacturing (doors/fabrication)
**Architecture:** VCL Forms + Paradox Database
**Date Analyzed:** 2025-12-01

---

## Executive Summary

QuoteProgram is a legacy Windows desktop application built in Delphi with VCL framework. It manages fabrication quotes for door and component manufacturing with multi-tab UI, customer/rep management, product databases, and quote tracking. The system uses Paradox database files for persistent storage and connects to an external "Emjac Sales System" for shared data operations.

---

## Project Structure

```
QuoteProgram/
├── Quote Program/              # Main application source
│   ├── Common/                # Shared components (15 files)
│   │   ├── ActLogin.pas       # User authentication form
│   │   ├── CustomerEdit.pas   # Customer management UI
│   │   ├── ESS_Data.pas       # Core data module (TDataModule)
│   │   ├── Message.pas        # Message dialog
│   │   ├── PickDate.pas       # Date picker utility
│   │   ├── PrintPreview.pas   # Print preview dialog
│   │   ├── ProductsEdit.pas   # Product maintenance UI
│   │   ├── RepsEdit.pas       # Sales rep management
│   │   ├── SalesmenEdit.pas   # Salesman management
│   │   ├── SplashPassword.pas # Splash screen
│   │   ├── SproApi.pas        # SPRO API integration (hex encoding/decoding)
│   │   └── Unit1.pas          # Utility functions
│   │
│   ├── Fab Quotes/            # Main quote application (25+ files)
│   │   ├── FabricationQuotes.dpr # Main program file (entry point)
│   │   ├── QuoteEdit.pas      # Quote form (tabs: heading, items, line details)
│   │   ├── QuoteList.pas      # Quote list/search interface
│   │   ├── QuotePrint.pas     # Quote printing logic
│   │   ├── ItemEntry.pas      # Item entry dialog
│   │   ├── OptionsWizard.pas  # Quote options configuration
│   │   ├── Consultant.pas     # Consultation form
│   │   ├── QuoteCopyLine.pas  # Quote line item copying
│   │   ├── UpdatePricing.pas  # Price update dialog
│   │   └── priv/              # Private/compiled output
│   │
│   ├── Maintenance/           # Database maintenance utilities
│   │   ├── CostingFactorEdit.pas
│   │   ├── ItemTypesEdit.pas
│   │   ├── ViaCodesEdit.pas
│   │   ├── StatesEdit.pas
│   │   ├── CommissionAcctsEdit.pas
│   │   ├── SellingTermsEdit.pas
│   │   ├── StockingList.pas
│   │   └── ProductsTest.pas
│   │
│   ├── Reports/               # Report generation (similar structure)
│   │   ├── Fab Quotes/       # Report versions of main forms
│   │   └── Products report app
│   │
│   ├── Sales Orders/          # Sales order module
│   │   ├── Fab Quotes/       # Integrated quote management
│   │   └── SalesOrderQuoteList.pas
│   │
│   ├── Utilities/             # Helper tools
│   │   ├── ExportQuote/      # Quote export utility
│   │   │   └── quote.txt     # Sample export data (CSV-like format)
│   │   └── CopyQuote/        # Quote copy utility
│   │
│   └── __history/             # Delphi version control (auto-generated)
│
└── Quote Data/                # Paradox database files
    ├── Doors/                # Door product database variant
    │   ├── Customer.DB       # Customer records
    │   ├── Quotes.DB         # Quote records
    │   ├── Items.DB          # Quote items
    │   ├── LineItems.DB      # Line item details
    │   ├── ItemType.DB       # Item type definitions
    │   ├── CostFact.DB       # Cost factors
    │   ├── Reps.DB           # Sales representatives
    │   ├── ViaCodes.DB       # Via codes (shipping method?)
    │   ├── Stocking.DB       # Stock levels
    │   ├── CommAcct.DB       # Commission accounts
    │   ├── Control.DB        # Control/metadata
    │   ├── Consults.DB       # Consultation records
    │   └── [Index/.FAM/.TV/.VAL files] # Paradox index/metadata
    │
    └── Fab/                  # Fabrication product database variant
        └── [Same structure as Doors/]
```

**Total Files:** 69+ Delphi source files (.pas), ~35+ database files

---

## Technology Stack

| Component | Details |
|-----------|---------|
| **Language** | Object Pascal (Delphi 7+) |
| **GUI Framework** | VCL (Visual Component Library) |
| **Database** | Paradox database (proprietary format) |
| **External API** | SPRO API (SProMeps library) for data exchange |
| **Forms Engine** | TForm-based UI with DataSource/TDataset binding |
| **Printing** | ReportSmith/RPSystem integration |
| **Authentication** | Custom login form (ActLogin.pas) |

---

## Core Architecture

### 1. Data Module (ESS_Data.pas)

Central TDataModule managing all database connections:

**Tables (Primary):**
- QuotesTable / QuotesSource
- ItemsTable / ItemsSource
- LineItemTable / LineItemSource
- CustomerTable / CustomerSource
- RepsTable / RepsSource
- SalesmenTable / SalesmenSource
- ProductsTable / ProductsSource
- ItemTypeTable / ItemTypeSource
- CostFactTable / CostFactSource
- TermsTable / TermsSource
- CommAcctTable / CommAcctSource
- ViaTable / ViaSource
- SalesOrderTable / SalesOrderSource
- SalesOrderItemsTable / SalesOrderItemsSource
- SalesOrderCommTable / SalesOrderCommSource

**Queries:**
- LastItemQuery
- LastLineItemQuery

**Database Connection:**
- SalesDatabase: TDatabase (main connection)

### 2. Quote Management Forms

**QuoteList.pas:**
- Main quote list/search interface
- Browse existing quotes
- Filter by customer/date range
- Launch quote edit/creation

**QuoteEdit.pas:**
- Multi-tab interface:
  - Tab 1: Quote Heading (job name, customer, sales rep, dates)
  - Tab 2: Item Details (table grid of items)
  - Tab 3: Line Item Details (line-level specifications)
- Controls:
  - Customer/Rep/Salesman search buttons
  - Popup menus for context actions
  - Save/Print/Exit buttons
  - Status bar for feedback

**QuotePrint.pas:**
- Quote printing/preview logic
- Print formatting
- Report generation integration

### 3. Item/Product Entry

**ItemEntry.pas:**
- Item entry dialog
- Quantity/specifications
- Product type selection

**OptionsWizard.pas:**
- Wizard-based quote configuration
- Step-through options selection

**QuoteCopyLine.pas:**
- Copy line items from existing quotes
- Bulk item addition

### 4. Supporting Components

**Consultant.pas:**
- Consultation/notes form
- Quote discussion tracking

**UpdatePricing.pas:**
- Bulk pricing updates
- Cost factor adjustments

**Maintenance Forms:**
- ItemTypesEdit, ViaCodesEdit, StatesEdit
- CostingFactorEdit, SellingTermsEdit
- CommissionAcctsEdit, StockingList
- ProductsEdit, RepsEdit, SalesmenEdit
- CustomerEdit

---

## Data Model

### Quote Record (Quotes Table)
```
QuoteNum        (Float)         - Unique quote identifier
JobName         (String)        - Job/project name
CustNum         (Float)         - Customer ID reference
SalesID         (String)        - Salesman ID
QuoteDate       (Date)          - Quote creation date
RevDate         (Date)          - Revision date
RevNum          (Integer)       - Revision number
SubTotal        (Currency)      - Quote subtotal
EstFreight      (Currency)      - Estimated freight
TotWeight       (Float)         - Total weight
TotCube         (Float)         - Total cubic footage
CustContact     (String)        - Primary contact
CustNotes       (Memo)          - Customer-facing notes
IntNotes        (Memo)          - Internal notes
```

### Item Record (Items Table)
```
QuoteNum        (FK to Quotes)
ItemID          (Integer)       - Line number
RecType         (Char)          - Record type (D=Door, F=Fabrication, etc.)
DoorQty         (Integer)       - Door quantity
Width/Height    (Feet+Inches)   - Door dimensions
Material        (Integer)       - Material code reference
Finish          (Integer)       - Finish code references
Construction    (Integer)       - Construction type
HingeType       (Integer)       - Hinge specification
Closer/Lock     (Integer)       - Hardware options
[30+ specification fields]
```

### Supporting Tables
- **Customer:** CustNum, Name, Address, City, State, Phone, Contact
- **Reps:** RepNum, CompanyName, Contact, City, Phone
- **Salesmen:** SalesID, Name
- **Products:** Type, MinQty, PriceBands (Qty1/Qty2/Qty3, Base/Price pairs)
- **ItemType:** Type codes
- **CostFact:** Cost factors with percentage adjustments
- **ViaCode:** Via codes (shipping methods)
- **CommAcct:** Commission account tracking

---

## Key Workflows

### 1. Create New Quote
1. QuoteList → New Quote button
2. QuoteEdit form opens
3. User fills quote heading (customer, rep, date)
4. User adds items via ItemEntry dialog
5. Optional: Launch OptionsWizard for configurations
6. User clicks Save
7. Quote persists to Paradox database
8. Update quote list

### 2. Edit Existing Quote
1. QuoteList → Select quote → Open
2. QuoteEdit form populates from database
3. User modifies heading/items/line details
4. Save updates database

### 3. Copy Quote
1. QuoteList → Select quote → Copy option
2. Optionally modify copy details
3. System creates new quote number
4. Linked items copied via QuoteCopyLine

### 4. Print Quote
1. QuoteEdit → Print button
2. QuotePrint dialog launches
3. Format/preview print layout
4. Send to printer via ReportSmith

### 5. Update Pricing
1. Maintenance utility (UpdatePricing)
2. Bulk update cost factors across products
3. Recalculate quote prices

---

## External Dependencies

### SPRO API (SproApi.pas)
Legacy data exchange protocol with hex encoding:
- **HexCharToDigit()** - Converts hex character to numeric digit
- **MakeHexChar()** - Converts byte to hex character
- **ConvertQueryStr()** - Query string hex encoding/decoding
- **UseSPro()** - Main API function with retry logic (NumRetries = 3)
  - INIT, FIND, QUERY, ADDR operations
  - DevelopID = '$519E'
  - MailCell/ShipCell = '$1C'/'$1D'
  - RB_SPRO_APIPACKET structure

### Emjac Sales System Reference
Many components use external paths to parent Emjac Sales System:
- `\Emjac Sales System\Source v2\Common\*.pas`
- Suggests QuoteProgram is a module within larger ERP system
- Shared data access via ESS_Data module

---

## Key Features

### Quote Management
- ✅ Create/Edit/Copy/Delete quotes
- ✅ Multi-revision tracking
- ✅ Customer/Rep/Salesman lookup
- ✅ Line item management
- ✅ Weight/cube calculations
- ✅ Sub-total calculations

### Product Catalog
- ✅ Material/Finish specifications
- ✅ Construction options
- ✅ Hardware selection (hinges, closers, locks)
- ✅ Custom sizing (feet/inches)
- ✅ Price banding by quantity

### Sales Operations
- ✅ Commission account tracking
- ✅ Sales order integration
- ✅ Rep/Salesman management
- ✅ Shipping method codes (via codes)

### Reporting
- ✅ Print quotes with formatting
- ✅ Export quotes (CSV-like format)
- ✅ Pricing reports
- ✅ Sales order reports

---

## Database Files Summary

### File Format Analysis (quote.txt sample)
```
Header:   Quote#, Job Name, Customer
Record:   Quote data with comma separation
Items:    QuoteNum, ItemID, RecType, DoorQty, Width, Height, ...
Format:   Legacy CSV-like export (possibly from Paradox)
Fields:   31+ columns per item record
```

---

## Known Characteristics

### Code Organization
- **Modular by Function:** Each form handles specific business domain
- **Shared Patterns:** DBEdit/DBCheckBox/DBGrid bound to TDataSource
- **Pop-up Menus:** Context-driven data access (customer search, etc.)
- **Status Bars:** Feedback and navigation hints

### Data Flow
- Central ESS_Data module provides database access
- Forms bind directly to TDataSource components
- No explicit service/business logic layer
- Updates flow directly from UI → Database

### Limitations
- No multi-user locking (Paradox limitation)
- No audit trail built-in
- Legacy SPRO API dependency
- Hard-coded paths to parent system components

---

## Relationship to JAC-V1 Project

**Context:** QuoteProgram is a legacy system being analyzed for potential modernization/integration with JAC-V1.

**Why?** The JAC-V1 project includes:
- Next.js-based dynamic form system
- MongoDB for data persistence
- AI-assisted workflows
- Modern validation (Zod) and architecture

**Potential Use Cases:**
1. **Data Migration:** Export QuoteProgram data → JAC-V1 MongoDB
2. **Feature Modernization:** Rebuild quote module with Next.js
3. **Integration:** API layer between legacy and modern systems
4. **Replacement:** Gradual migration to JAC-V1 forms engine

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Delphi Source Files | 69+ |
| Main Application Files | 25+ |
| Maintenance Forms | 8 |
| Database Tables | 15+ |
| Paradox Data Files | 35+ |
| External API Integrations | 1 (SPRO) |
| Forms/UI Components | 50+ |
| Estimated Lines of Code | 15,000+ |

---

## Technical Debt & Modernization Opportunities

| Area | Issue | Solution |
|------|-------|----------|
| **Database** | Paradox (EOL, no multi-user) | Migrate to PostgreSQL/MongoDB |
| **UI Framework** | VCL (Windows-only desktop) | Rebuild with React/Next.js |
| **API Integration** | Legacy SPRO hex protocol | RESTful/GraphQL API |
| **Code Organization** | Form-driven, no separation of concerns | Layered architecture (models, services, controllers) |
| **Validation** | Implicit in UI controls | Centralized schema (Zod) |
| **Testing** | No unit tests | Add Jest/Vitest test suite |
| **Deployment** | Manual distribution | CI/CD pipeline (GitHub Actions) |

---

## Unresolved Questions

1. **What is the SPRO API used for?** Appears to be legacy data exchange—is it still active?
2. **How does QuoteProgram integrate with parent Emjac Sales System?** Shared data module suggests dependency—what's the integration boundary?
3. **Is multi-language support needed?** Current implementation is English-only—any i18n requirements?
4. **Authentication:** Is current login sufficient or does modernization require OAuth/SSO?
5. **Who maintains this system?** Active development or legacy maintenance mode?
6. **Performance requirements?** Expected quote volume/concurrent users?

---

**Generated:** 2025-12-01 | **Analysis Type:** Legacy System Architecture Review

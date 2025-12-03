# QuoteProgram - Complete File Index

**Total Source Files:** 116 (.pas + .dpr + .dfm files)
**Generated:** 2025-12-01

---

## Directory Structure & File Listing

### Common Shared Components (32 files)

Located: `Quote Program/Common/`

Core shared functionality across all modules.

| File | Type | Purpose |
|------|------|---------|
| ESS_Data.pas / .dfm | Data Module | **CRITICAL** - Central database module with all TTable/TDataSource/TQuery definitions |
| ActLogin.pas / .dfm | Form | User authentication login screen |
| SplashPassword.pas / .dfm | Form | Splash/password dialog |
| Message.pas / .dfm | Form | Custom message dialog |
| PickDate.pas / .dfm | Dialog | Date picker utility |
| CustomerEdit.pas / .dfm | Form | Customer master record editor |
| CustomerList.pas / .dfm | Form | Customer list/search interface |
| ProductsEdit.pas / .dfm | Form | Product master record editor |
| ProductsList.pas / .dfm | Form | Product list/search interface |
| RepsEdit.pas / .dfm | Form | Sales rep master record editor |
| RepsList.pas / .dfm | Form | Sales rep list/search interface |
| SalesmenEdit.pas / .dfm | Form | Salesman master record editor |
| SalesmenList.pas / .dfm | Form | Salesman list/search interface |
| PrintPreview.pas / .dfm | Dialog | Print preview dialog |
| SproApi.pas | Unit | SPRO API integration (hex encoding/decoding) |
| Unit1.pas / .dfm | Utility | Utility functions |

**Key Dependency:** All forms in other modules depend on ESS_Data.pas for database access.

---

### Fab Quotes Module (21 files)

Located: `Quote Program/Fab Quotes/`

Main quote application for fabrication quotes.

| File | Type | Purpose |
|------|------|---------|
| FabricationQuotes.dpr | Program | **MAIN EXECUTABLE** - Application entry point |
| QuoteList.pas / .dfm | Form | Quote list/search interface (main launcher) |
| QuoteEdit.pas / .dfm | Form | Quote editor (multi-tab: heading, items, line details) |
| ItemEntry.pas / .dfm | Dialog | Item entry dialog for adding products |
| QuotePrint.pas / .dfm | Form | Quote printing logic & layout |
| OptionsWizard.pas / .dfm | Wizard | Step-through quote configuration |
| QuoteCopyLine.pas / .dfm | Dialog | Copy line items from existing quotes |
| Consultant.pas / .dfm | Form | Consultation/notes form |
| UpdatePricing.pas / .dfm | Dialog | Bulk pricing updates |
| tables.pas / .dfm | Utility | Table definitions/queries |
| priv/ | Directory | Compiled output (private) |

**Entry Point:** FabricationQuotes.dpr → Creates forms in sequence, launches QuoteList

**Dependencies:** All forms depend on ESS_Data from Common/

---

### Maintenance Module (27 files)

Located: `Quote Program/Maintenance/`

Database maintenance utilities for configuration tables.

| File | Type | Purpose |
|------|------|---------|
| ESS_Maintenance.dpr | Program | Maintenance application entry point |
| MaintenanceMenu.dfm / .pas | Form | Menu for selecting maintenance functions |
| ItemTypesEdit.pas / .dfm | Form | Item type code maintenance |
| ViaCodesEdit.pas / .dfm | Form | Via code (shipping method) maintenance |
| StatesEdit.pas / .dfm | Form | State code maintenance |
| CostingFactorEdit.pas / .dfm | Form | Cost factor percentage maintenance |
| SellingTermsEdit.pas / .dfm | Form | Selling terms maintenance |
| CommissionAcctsEdit.pas / .dfm | Form | Commission account maintenance |
| StockingList.pas / .dfm | Form | Stock level maintenance |
| ProductsTest.pas / .dfm | Form | Product testing/validation |
| ConsultantsEdit.pas / .dfm | Form | Consultant record maintenance |
| Control.pas / .dfm | Form | Control record maintenance |
| DoorOptList.pas / .dfm | Form | Door option maintenance |
| QuoteStatus.pas / .dfm | Form | Quote status tracking |
| StatusReason.pas / .dfm | Form | Status reason codes |
| StdNotesEdit.pas / .dfm | Form | Standard notes maintenance |
| prodsql.pas / .dfm | Query Tool | Product SQL query tool |
| sql.dpr | Program | SQL utility |
| ReportMenu.dfm / .pas | Form | Report menu launcher |

**Purpose:** Direct database table maintenance for configuration data.

**Note:** Some forms duplicated across Reports/ and Sales Orders/ with same functionality.

---

### Reports Module (18 files)

Located: `Quote Program/Reports/`

Report generation and export functionality.

**Structure:**
- ReportMenu.pas / .dfm - Menu launcher
- prod.pas / .dfm - Product report
- products.dpr - Product report app
- Fab Quotes/ (8 files) - Quote reports duplicate of main Fab Quotes module
  - FabricationQuotes.dpr
  - QuoteList.pas / .dfm
  - QuoteEdit.pas / .dfm
  - ItemEntry.pas / .dfm
  - QuotePrint.pas / .dfm
  - OptionsWizard.pas / .dfm
  - QuoteCopyLine.pas / .dfm
  - UpdatePricing.pas / .dfm
  - tables.pas / .dfm

**Purpose:** Report variants with specialized printing/export logic.

---

### Sales Orders Module (22 files)

Located: `Quote Program/Sales Orders/`

Sales order management (integrates quote functionality).

| File | Type | Purpose |
|------|------|---------|
| FabSalesOrders.dpr | Program | Sales order application entry point |
| SalesOrderList.pas / .dfm | Form | Sales order list/search |
| SalesOrderEdit.pas / .dfm | Form | Sales order editor |
| SalesOrderFind.pas / .dfm | Dialog | Sales order search dialog |
| SalesOrderPrint.pas / .dfm | Form | Sales order printing |
| SalesOrderQuoteList.pas / .dfm | Form | Quotes linked to sales order |
| Fab Quotes/ (11 files) - Embedded quote module within sales orders
  - FabricationQuotes.dpr
  - QuoteList.pas / .dfm
  - QuoteEdit.pas / .dfm
  - ItemEntry.pas / .dfm
  - QuotePrint.pas / .dfm
  - OptionsWizard.pas / .dfm
  - QuoteCopyLine.pas / .dfm
  - UpdatePricing.pas / .dfm
  - tables.pas / .dfm

**Purpose:** Sales order management with integrated quote support.

**Note:** Duplicates quote forms - suggests potential refactoring opportunity.

---

### Utilities Module (9 files)

Located: `Quote Program/Utilities/`

Helper tools for quote and data management.

**CopyQuote/ (2 files)**
- CopyQuote.dpr / Unit1.pas / .dfm
- Purpose: Copy existing quotes
- Project1.dpr (alternate)

**CopyQuoteItems/ (2 files)**
- Project1.dpr / Unit1.pas / .dfm
- Purpose: Copy quote line items

**CopyQuoteLineItems/ (2 files)**
- Project1.dpr / Unit1.pas / .dfm
- Purpose: Copy detailed line-item specifications

**ExportQuote/ (3+ files)**
- DoorsQuoteExport.dpr / Unit1.pas / .dfm
- quote.txt - Sample export data
- Purpose: Export quotes to CSV/text format

**Common Pattern:** Each utility is standalone .dpr executable

---

## Database Files Index

### Location: `Quote Data/`

#### Doors Variant (17 files)
`Quote Data/Doors/`

Product database specialization for door products.

**Core Tables:**
- Customer.DB / .PX / .XG0 / .XG1 / .XG2 / .XG3 / .X10 / .VAL
- Quotes.DB / .PX / .XG0 / .XG1 / .MB / .VAL
- Items.DB / .PX / .XG0
- LineItems.DB / .PX
- Products.DB / .PX / .X10 / .XG0 / .XG1 / .XG2 / .XG3
- Reps.DB / .PX / .FAM / .TV / .VAL
- ItemType.DB / .PX / .MB
- CostFact.DB / .PX / .FAM / .TV
- ViaCode.DB / .PX

**Configuration:**
- DoorOpt.DB / .PX / .FAM / .TV
- Stocking.DB / .PX / .XG0 / .YG0
- CommAcct.DB / .PX / .XG0 / .YG0
- Consults.DB / .PX / .MB
- Control.DB / .PX

#### Fab Variant (17 files)
`Quote Data/Fab/`

Product database specialization for fabrication products.

**Same structure as Doors variant** - separate database for fabrication product specs and pricing.

#### File Format Key

| Extension | Meaning | Purpose |
|-----------|---------|---------|
| .DB | Database table data | Actual table records |
| .PX | Primary index | Fast lookups on primary key |
| .XG* | Secondary index | Fast lookups on other fields |
| .YG* | Memo index | Index for memo/text fields |
| .MB | Memo block | Storage for large text fields |
| .FAM | Family file | Paradox metadata |
| .TV | Table view | Saved query/view definition |
| .VAL | Validity check | Field validation rules |
| .X10 | Extended index | 10-byte index |

---

## File Dependencies & Call Graph

```
┌─ FabricationQuotes.dpr (main executable)
│
├─ Common/
│  └─ ESS_Data.pas ──────────────────────┐
│                                         │
├─ Fab Quotes/                           │
│  ├─ QuoteList.pas ◄──────────────────┐ │
│  │  uses ESS_Data                     │ │
│  │                                    │ │
│  ├─ QuoteEdit.pas ◄──────────────────┼─┤ (main forms)
│  │  uses ESS_Data, QuoteList         │ │
│  │                                    │ │
│  ├─ ItemEntry.pas ◄──────────────────┤ │
│  │  uses ESS_Data                     │ │
│  │                                    │ │
│  ├─ QuotePrint.pas ◄────────────────┐│ │
│  │  uses ESS_Data                    ││ │
│  │                                   ││ │
│  ├─ OptionsWizard.pas ◄─────────────┤│ │
│  │  uses ESS_Data                    ││ │
│  │                                   ││ │
│  ├─ QuoteCopyLine.pas ◄─────────────┤│ │
│  │  uses ESS_Data                    ││ │
│  │                                   ││ │
│  ├─ Consultant.pas                  ││ │
│  ├─ UpdatePricing.pas               ││ │
│  └─ tables.pas ◄──────────────────────┴─┘
│
└─ Common/
   ├─ ActLogin.pas (authentication)
   ├─ CustomerEdit.pas
   ├─ ProductsEdit.pas
   ├─ RepsEdit.pas
   ├─ SalesmenEdit.pas
   ├─ PrintPreview.pas
   ├─ Message.pas
   ├─ PickDate.pas
   ├─ SproApi.pas (API integration)
   └─ Unit1.pas (utilities)
```

---

## Critical Paths & Important Files

### For Understanding Architecture
1. **ESS_Data.pas** - Start here (data layer)
2. **QuoteEdit.pas** - Main UI/workflow
3. **QuoteList.pas** - Entry point UI
4. **FabricationQuotes.dpr** - Application initialization

### For Data Access
1. **ESS_Data.pas** - All table/query definitions
2. **tables.pas** (Fab Quotes) - Additional table logic
3. Database files - `Quote Data/Doors/` or `Quote Data/Fab/`

### For Integration
1. **SproApi.pas** - Legacy API protocol
2. **FabricationQuotes.dpr** - Application startup

### For Maintenance
1. **Maintenance/MaintenanceMenu.pas** - Maintenance app entry
2. **Maintenance/[*Edit].pas** - Configuration editors

---

## Code Duplication Alert 🚨

**High Duplication:** Quote module replicated 3 times
- `Fab Quotes/FabricationQuotes.dpr`
- `Reports/Fab Quotes/FabricationQuotes.dpr`
- `Sales Orders/Fab Quotes/FabricationQuotes.dpr`

Same files in all three directories with minimal differences.

**Refactoring Opportunity:** Extract quote module to shared library (.DLL) to reduce duplication.

---

## File Statistics

| Category | Count | Total |
|----------|-------|-------|
| Program Files (.dpr) | 7 | - |
| Form Units (.pas) | 85+ | - |
| Form Designs (.dfm) | 85+ | - |
| Data Tables (.DB) | 15+ | 2 variants |
| Index Files (.PX, .XG*, etc.) | 60+ | - |
| **Total Files** | **250+** | - |
| **Source Code Only** | **116** | .pas/.dpr/.dfm |

---

## Naming Conventions

### Forms
- `[FunctionName]List.pas` - Browse/search list (QuoteList, CustomerList)
- `[FunctionName]Edit.pas` - Record editor (QuoteEdit, CustomerEdit)
- `[FunctionName]Dialog` - Modal dialog (ItemEntry, UpdatePricing)
- `[Function]Wizard.pas` - Step-through wizard (OptionsWizard)
- `[Function]Print.pas` - Printing/report logic (QuotePrint)

### Program Files
- `[Application]Quotes.dpr` - Quote-related app
- `ESS_Maintenance.dpr` - Maintenance utility
- `FabSalesOrders.dpr` - Sales order app

### Modules/Units
- Descriptive name matching form function

---

## Cross-Module References

**Sales Orders → Fab Quotes**
- SalesOrderEdit includes quote management
- Can create/edit quotes within sales order context

**Reports → Main Fab Quotes**
- Duplicate forms with reporting specialization
- Suggests separation of concerns opportunity

**Utilities → All Modules**
- CopyQuote utilities reference quote tables
- ExportQuote exports quote data

---

## Version Control & Backup

- **__history/** directories - Delphi auto-backup (enable in IDE)
- **~$[filename].pas** - Temporary backup files
- No explicit version control visible in file structure

**Recommendation:** Implement Git or formal version control.

---

## Summary

This QuoteProgram codebase contains:

✅ **69+ source files** (.pas, .dpr)
✅ **7 executable applications** (main app + utilities)
✅ **50+ UI forms** for various functions
✅ **30+ database files** (Paradox) across 2 variants
✅ **Significant code duplication** (quote module x3)
✅ **Clear modular structure** by business function
❌ **No apparent version control** system
❌ **No formal testing framework**

**For modernization:** Start with ESS_Data.pas analysis and Paradox data export, then plan migration strategy.

---

**Generated:** 2025-12-01 | Analysis Type: File Inventory & Structure Documentation

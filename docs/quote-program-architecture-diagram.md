# QuoteProgram - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                          │
│                       (VCL Forms - Delphi)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  QuoteList.pas   │  │  QuoteEdit.pas   │  │ ItemEntry.pas    │   │
│  │  (Quote Search)  │  │ (Multi-Tab Form) │  │ (Item Dialog)    │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │                     │              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │         Related Forms (Forms Grid, Context Menus)            │  │
│  │  - QuotePrint.pas, OptionsWizard.pas, Consultant.pas         │  │
│  │  - QuoteCopyLine.pas, UpdatePricing.pas                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│           │                                                           │
└───────────┼───────────────────────────────────────────────────────────┘
            │
            ├─────────────────────────────────────────┐
            │                                         │
┌───────────▼──────────────────────┐   ┌─────────────▼──────────────┐
│    DATA MODULE LAYER             │   │  MAINTENANCE FORMS         │
│    (ESS_Data.pas)                │   │  (Direct DB Access)        │
├──────────────────────────────────┤   ├────────────────────────────┤
│ TDataModule:                      │   │ - ItemTypesEdit.pas        │
│  ├─ 15 Tables (TTable)           │   │ - ViaCodesEdit.pas         │
│  ├─ 5+ DataSources (TDataSource) │   │ - StatesEdit.pas           │
│  ├─ 2 Queries (TQuery)           │   │ - CostingFactorEdit.pas    │
│  └─ SalesDatabase (TDatabase)    │   │ - SellingTermsEdit.pas     │
│                                  │   │ - CommissionAcctsEdit.pas  │
│ Provides:                        │   │ - StockingList.pas         │
│  - Database connections          │   │ - ProductsTest.pas         │
│  - Query execution               │   │ - ProductsEdit.pas         │
│  - Data binding for UI           │   │ - RepsEdit.pas             │
│                                  │   │ - SalesmenEdit.pas         │
└───────────┬──────────────────────┘   │ - CustomerEdit.pas         │
            │                          └────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Paradox)                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PRIMARY TABLES:                    INDEX/METADATA:             │
│  ├─ Quotes          (QuoteNum PK)   ├─ .DB   (data file)        │
│  ├─ Items           (QuoteNum FK)   ├─ .PX   (primary index)    │
│  ├─ LineItems       (QuoteNum FK)   ├─ .XGn  (secondary indexes)│
│  ├─ Customer        (CustNum PK)    ├─ .YGn  (memo indexes)     │
│  ├─ Reps            (RepNum PK)     ├─ .MB   (memo block)       │
│  ├─ Salesmen        (SalesID PK)    ├─ .FAM  (family file)      │
│  ├─ Products        (Type PK)       ├─ .TV   (table view)       │
│  ├─ ItemType        (Type PK)       └─ .VAL  (validity check)   │
│  ├─ CostFact        (Factor PK)                                 │
│  ├─ ViaCode         (Code PK)                                   │
│  ├─ CommAcct        (AcctNum PK)                                │
│  ├─ SalesOrder      (OrderNum PK)                               │
│  ├─ SalesOrderItems (FK composite)                              │
│  └─ Control         (metadata)                                  │
│                                                                   │
│ Database Variants:                                               │
│  ├─ Doors/    (Door product specialization)                    │
│  └─ Fab/      (Fabrication product specialization)             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User Action                 Form Processing              Database Update
─────────────────────────────────────────────────────────────────────

Create New Quote:
  User clicks               QuoteEdit form              Quote record
  "New Quote"       ──────> instantiates    ──────────> added to Quotes
  button            Opens   blank form      Posts data  table

                            Populates UI    ╱─────────╲
                            from defaults   │ Customer  │
                            (empty)         │ Reps      │
                                            │ Salesmen  │
                                            └─────────┘

Edit Quote:
  User selects              Form populates   ──────────> Queries execute
  quote in list    ──────>  with data from   Loads data  (LastItemQuery,
  & clicks Open            bound datasources            LastLineItemQuery)

                            User modifies    ──────────> Edits reflected
                            fields, adds     Posts data  in Paradox
                            items

Save Quote:
  User clicks               Validates data   ──────────> TDataset.Post()
  "Save"           ──────>  Updates datasource           Paradox commit
  button                    (auto-calculates
                            weights/cubes)

Print Quote:
  User clicks               QuotePrint loads  ──────────> ReportSmith/
  "Print"          ──────>  quote data        Retrieves  RPSystem renders
  button                    from datasources  layout      & outputs to
                                                          printer
```

---

## Database Schema (Simplified)

```
QUOTES TABLE
─────────────────────────────────────────────────────────────────
QuoteNum (PK)  │ JobName    │ CustNum (FK) │ SalesID (FK) │ ...
33376          │ D33376     │ 12           │ ABC          │
33377          │ Project X  │ 5            │ DEF          │


ITEMS TABLE
─────────────────────────────────────────────────────────────────
QuoteNum (FK) │ ItemID │ RecType │ Material │ Finish1 │ Finish2 │ ...
33376         │ 1      │ D       │ 21       │ 11      │ 11      │
33376         │ 2      │ F       │ 21       │ 11      │ NULL    │
33376         │ 3      │ F       │ 21       │ 11      │ NULL    │


LINE_ITEMS TABLE
─────────────────────────────────────────────────────────────────
QuoteNum (FK) │ ItemID (FK) │ WidthFt │ WidthIn │ HeightFt │ ...
33376         │ 1           │ 6       │ 0       │ 7        │
33376         │ 1           │ 6       │ 0       │ 7        │
33376         │ 2           │ 6       │ 0       │ 7        │


CUSTOMER TABLE (Lookup)
─────────────────────────────────────────────────────────────────
CustNum (PK) │ Name              │ Address     │ City    │ State
12           │ Electro-Door Inc. │ 123 Main    │ Boston  │ MA
5            │ ABC Manufacturing │ 456 Oak     │ NYC     │ NY


PRODUCTS TABLE (Lookup)
─────────────────────────────────────────────────────────────────
Type (PK) │ MinQty │ Qty1 │ Base1 │ Price1 │ Qty2 │ Base2 │ Price2 │ ...
21        │ 1      │ 1    │ 50.00 │ 75.00  │ 10   │ 45.00 │ 60.00  │
```

---

## Component Dependency Graph

```
┌──────────────────────────────────┐
│   FabricationQuotes.dpr           │
│   (Main Program Entry Point)      │
└────────────────┬─────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 │                                         │
         ┌───────▼────────┐                       ┌────────▼────────┐
         │ QuoteList.pas  │                       │ QuoteEdit.pas   │
         │ (List/Search)  │                       │ (Edit/Create)   │
         └────────┬───────┘                       └────────┬────────┘
                  │                                        │
                  ├────────────┬────────────────────────────┤
                  │            │                            │
                  │      ┌─────▼──────┐         ┌──────────▼────┐
                  │      │ItemEntry   │         │QuotePrint.pas │
                  │      │OptionsWiz  │         │(Print logic)  │
                  │      │QuoteCopyLne│         └───────────────┘
                  │      │Consultant  │
                  │      └────────────┘
                  │
                  └──────────────────┬──────────────────┘
                                     │
                          ┌──────────▼─────────────┐
                          │   ESS_Data.pas         │
                          │   (TDataModule)        │
                          │ - 15 Tables            │
                          │ - 5+ DataSources       │
                          │ - 2 Queries            │
                          │ - 1 Database Connection│
                          └──────────────┬─────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │   Paradox Database          │
                          │   (Multiple .DB files)      │
                          │   ├─ Customer              │
                          │   ├─ Quotes                │
                          │   ├─ Items                 │
                          │   ├─ LineItems             │
                          │   ├─ Products              │
                          │   └─ [10+ more tables]     │
                          └──────────────────────────┘


PARALLEL DEPENDENCIES (Maintenance):
┌────────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│ItemTypesEdit   │  │ViaCodesEdit      │  │CostingFactorEdit       │
│StatesEdit      │──│SellingTermsEdit  │  │CommissionAcctsEdit     │
│StockingList    │  │ProductsEdit      │──│SalesmenEdit/RepsEdit   │
│ProductsTest    │  │CustomerEdit      │  │                        │
└────────────────┘  └──────────────────┘  └────────────────────────┘
         │                   │                         │
         └───────────────────┼─────────────────────────┘
                             │
                      ┌──────▼────────┐
                      │  ESS_Data.pas  │
                      │  (same module) │
                      └────────────────┘
```

---

## Data Binding Architecture

```
UI FORM                    DATA SOURCE              DATABASE
──────────────────────────────────────────────────────────

TQuoteEdit
│
├─ EditJobName (TDBEdit)    ──╮
├─ EditCustNum (TDBEdit)    ──┤
├─ EditSalesID (TDBEdit)    ──┤
├─ MemoNotes (TDBMemo)      ──┤
│                              │
├─ GridLineItems (TDBGrid)  ──┤
│                              ├─ QuotesSource   ──┐
├─ TextTotalWeight          ──┤  (TDataSource)     │
│                              │                    ├─ QuotesTable
└─ TextTotalCube (TDBText)  ──┤                    │  (TTable)
                               │                    │
                             ┌─┴──────────────────┐ │
                             │ ESS_Data.pas       │ │
                             │ (TDataModule)      │ │
                             │                    │ │
                             │ ┌─ Database conn  ├─┼─ Paradox
                             │ ├─ SalesDatabase  │ │ (.DB Files)
                             │ └─ Query logic    │ │
                             └────────────────────┘ │
                                                    └─

BINDING MECHANISM:
  TDBEdit.DataSource   → QuotesSource
  QuotesSource.Dataset → QuotesTable
  QuotesTable.DatabaseName → Paradox file path
  QuotesTable.TableName → Physical table name

  Result: Bi-directional data sync (UI ↔ DB)
```

---

## Module Organization

```
APPLICATION TIERS
─────────────────────────────────────────────────────────────

PRESENTATION TIER (UI)
├─ Quote Management        ├─ Customer Functions      ├─ Reports
│  ├─ QuoteList           │  ├─ CustomerList        │  ├─ Quote Reports
│  ├─ QuoteEdit           │  ├─ CustomerEdit        │  └─ Sales Order
│  ├─ ItemEntry           │  └─ CustomerSearch      │     Reports
│  ├─ OptionsWizard       │                         │
│  ├─ QuoteCopyLine       ├─ Product Functions      ├─ Utilities
│  ├─ Consultant          │  ├─ ProductsList        │  ├─ ExportQuote
│  └─ UpdatePricing       │  ├─ ProductsEdit        │  └─ CopyQuote
│                          │  └─ ItemEntry          │
├─ Sales Rep Functions     │                         ├─ Authentication
│  ├─ RepsList            ├─ System Admin           │  ├─ ActLogin
│  ├─ RepsEdit            │  ├─ ItemTypesEdit       │  └─ SplashPassword
│  ├─ SalesmenList        │  ├─ ViaCodesEdit        │
│  └─ SalesmenEdit        │  ├─ StatesEdit          ├─ Common
│                          │  ├─ CostingFactorEdit   │  ├─ Message
│                          │  ├─ SellingTermsEdit    │  ├─ PickDate
│                          │  ├─ CommAcctEdit       │  ├─ PrintPreview
│                          │  └─ StockingList       │  └─ Unit1

DATA TIER (Database)
├─ Core Tables            ├─ Lookup Tables          ├─ Transaction Tables
│  ├─ Quotes             │  ├─ Customer            │  ├─ SalesOrder
│  ├─ Items              │  ├─ Reps                │  ├─ SalesOrderItems
│  └─ LineItems          │  ├─ Salesmen            │  └─ SalesOrderComm
│                         │  ├─ Products            │
├─ Configuration Tables   │  ├─ ItemType
│  ├─ CostFact           │  ├─ ViaCode
│  ├─ CommAcct           │  ├─ Terms
│  └─ Control            │  └─ Stocking

INTEGRATION LAYER (Bridge)
├─ ESS_Data Module (Central hub)
├─ SPRO API (Legacy protocol)
└─ Emjac Sales System (Parent system reference)
```

---

## Form Interaction Flow

```
                        START APPLICATION
                               │
                               ▼
                        ┌─────────────────┐
                        │ ActLogin.pas    │
                        │ (Authentication)│
                        └────────┬────────┘
                                 │ (Success)
                                 ▼
                        ┌─────────────────┐
                        │ QuoteList.pas   │
                        │ (Main Interface)│
                        └─────────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │  CREATE  │  │  EDIT    │  │ DELETE   │
              │  QUOTE   │  │  QUOTE   │  │ QUOTE    │
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   ▼             │             │
            ┌────────────────┐   │             │
            │QuoteEdit.pas   │◄──┘             │
            │(Multi-tab form)│   ┌─────────────┘
            └─────┬──────────┘   │
                  │              │ (Confirm Delete)
                  ├─────┬────────┤
                  │     │        │
                  ▼     ▼        ▼
            ┌──────────────────────────┐
            │ ItemEntry.pas            │  ◄─ Item Management
            │ OptionsWizard.pas        │
            │ QuoteCopyLine.pas        │
            │ Consultant.pas           │
            └──────────┬───────────────┘
                       │
                       ▼
              ┌─────────────────────┐
              │ Save/Update Database│
              │ (ESS_Data posting)  │
              └──────────┬──────────┘
                         │
                    ┌────┴─────┐
                    ▼          ▼
              ┌────────┐  ┌──────────┐
              │ PRINT  │  │ EXPORT   │
              │ QUOTE  │  │ QUOTE    │
              └────┬───┘  └────┬─────┘
                   │           │
                   ▼           ▼
          ┌──────────────┐  ┌─────────┐
          │QuotePrint    │  │Export   │
          │(ReportSmith) │  │Utility  │
          └──────────────┘  └─────────┘
```

---

## Technology Stack Layer View

```
┌─────────────────────────────────────────────────────────────────┐
│                      OPERATING SYSTEM                           │
│                      (Windows XP / 7 / 10)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DELPHI RUNTIME                              │
│               (Delphi 7+ RTL / VCL Components)                 │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│ │ Forms (TForm)│DB Components │StdCtrls      │ComCtrls        │ │
│ │ (100+ UI)    │ (TTable,etc) │ (Button,Edit)│(TabSheets,etc) │ │
│ │              │              │              │                │ │
│ │ Dialogs      │Menus         │Grids         │Graphics        │ │
│ │ (TOpenDialog)│(TMenuItem)   │(TDBGrid)     │(TCanvas)       │ │
│ └──────────────┴──────────────┴──────────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                              │
│               (FabricationQuotes.exe compiled)                  │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
│ │ Quote Module   │  │Customer Module │  │ Report Module       │ │
│ │ (25+ forms)    │  │ (8+ forms)     │  │ (Similar structure) │ │
│ │                │  │                │  │                     │ │
│ │ Maintenance    │  │ Utilities      │  │ Integration Layer   │ │
│ │ (5+ forms)     │  │ (Export, Copy) │  │ (SPRO API)          │ │
│ └────────────────┘  └────────────────┘  └─────────────────────┘ │
└──────────────────────────────────┬────────────────────────────────┘
                                   │
┌──────────────────────────────────┴────────────────────────────────┐
│              DATABASE ACCESS LAYER (BDE)                          │
│         (Borland Database Engine - TDatabase, TTable)            │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ ESS_Data Module (TDataModule) - Central Hub                  │ │
│ │  - Table management (15 TTable instances)                    │ │
│ │  - DataSource binding (5+ TDataSource)                       │ │
│ │  - Query execution (2+ TQuery)                               │ │
│ │  - Database connection (1 TDatabase)                         │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬────────────────────────────────┘
                                   │
┌──────────────────────────────────▼────────────────────────────────┐
│              FILE SYSTEM LAYER (Paradox Database)                 │
│                    (30+ .DB files + indexes)                      │
├──────────────────────────────────────────────────────────────────┤
│ Doors Variant              Fab Variant              Config        │
│ ├─ Customer.DB            ├─ Customer.DB           ├─ Control.DB │
│ ├─ Quotes.DB              ├─ Quotes.DB             └─ [Meta]     │
│ ├─ Items.DB               ├─ Items.DB                            │
│ ├─ Products.DB            ├─ Products.DB                         │
│ └─ [Index files: .PX, .XG*, .YG*, .FAM, .TV, .VAL]              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Summary

- **Presentation:** VCL Forms (50+ UI components)
- **Business Logic:** Form-driven (no separate layer)
- **Data Access:** TDataset/TDataSource binding to TTable
- **Database:** Paradox with 15+ core tables
- **Integration:** ESS_Data module + SPRO API
- **External:** References Emjac Sales System (parent)


# Nutrition catalog options

Research date: 2026-08-16. Requirements: zero operating cost, Spanish-only interface, useful European foods, clear reuse rights, and a small catalog. This source comparison predates the static architecture; see [ADR 0007](../adr/0007-versioned-catalog-local-activity.md). Source artifacts and attribution still require review before import.

## Decision

Use a curated subset of a few hundred common ANSES Ciqual 2025 foods as the initial catalog. Import only useful foods and the required nutrients, add our own Spanish labels, retain source ID and source version, and allow personal variants. Updates are manual when a useful new dataset version appears.

Ciqual 2025 contains 3,484 foods and 74 components and provides XLSX, XLS, and XML downloads. Its Etalab Open Licence 2.0 permits reuse, transformation, and translation with attribution. It offers the best current balance of European relevance, manageable size, recency, and legal clarity.

## Considered sources

| Source | Fit | Decision concern |
|---|---|---|
| ANSES Ciqual 2025 | European foods, clear download, permissive reuse with attribution | French source labels require our own Spanish labels |
| USDA FoodData Central | Strong API and bulk downloads under CC0 | English and US-oriented; complete dataset is unnecessarily large |
| BEDCA / AESAN | Spanish foods and terminology | No documented public API or bulk download; reuse terms are ambiguous for automated import |
| Open Food Facts | Strong Spanish packaged-product and barcode coverage | Collaborative quality, API limits, ODbL share-alike, and database-combination constraints |
| EFSA EU FCDB 2026 | Broad new European composition dataset | Bulk access, Spanish coverage, and third-party reuse rights are not yet clear enough |

BEDCA may be consulted manually but is not imported without written permission. Open Food Facts remains relevant only if barcode scanning becomes a future requirement.

## Initial import shape

- Energy
- Protein
- Carbohydrate
- Fat
- Optional fibre if product scope confirms it
- Spanish display label maintained by Foodie Planner
- Source identifier and dataset version
- User-corrected values stored separately from source values

Mass foods normalize nutrition per 100 g, volume foods per 100 ml, and count foods per unit.

Small differences between catalog values and a purchased product are accepted. A meaningful difference creates a duplicated personal food variant with label values. Inventory holdings and batches do not override nutrition.

## Sources

- [ANSES Ciqual 2025 dataset](https://entrepot.recherche.data.gouv.fr/dataset.xhtml?persistentId=doi:10.57745/RDMHWY)
- [Etalab Open Licence 2.0](https://www.data.gouv.fr/pages/legal/licences/etalab-2.0)
- [USDA FoodData Central API and licence](https://fdc.nal.usda.gov/api-guide/)
- [BEDCA reuse conditions](https://www.bedca.net/bdpub/UsoBD.pdf)
- [Open Food Facts API](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/)
- [EFSA EU Food Composition Database](https://www.efsa.europa.eu/en/data-report/food-composition)

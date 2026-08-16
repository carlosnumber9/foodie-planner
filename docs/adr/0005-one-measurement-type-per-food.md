# Assign one measurement type to each food

Every food owns one immutable measurement type: mass, volume, or count. Recipe, inventory, and shopping quantities for that food use units within that type. The same real-world ingredient may have separate food records, such as `Tomato (count)` and `Tomato (g)`. This replaces food-specific cross-type equivalences with a simpler model that always compares like quantities.

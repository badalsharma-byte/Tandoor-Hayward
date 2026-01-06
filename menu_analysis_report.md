# Menu Price Analysis Report

## Matched Items (Verified)
| HTML Name | Excel Name | HTML Price | Excel Price | Status |
|---|---|---|---|---|
| Chicken Biryani | Chicken Biryani | $14.99 | $14.99 | ✅ |
| Lamb Biryani | Lamb Biryani | $15.99 | $15.99 | ✅ |
| Plain Basmati Rice | Basmati Rice | $4.49 | $4.49 | ✅ |
| Shrimp Biryani | Shrimp Biryani | $15.99 | $15.99 | ✅ |
| Vegetable Biryani | Vegetable Biryani | $11.99 | $11.99 | ✅ |
| Aloo Paratha | Paratha (Aloo, Gobhi, Mooli) | $4.99 | $4.99 | ✅ |
| Butter Naan | Butter Naan | $2.99 | $2.99 | ✅ |
| Garlic Naan | Garlic Naan | $2.99 | $2.99 | ✅ |
| Naan | Plain Naan | $2.49 | $2.49 | ✅ |
| Paratha | Plain Paratha | $2.99 | $2.99 | ✅ |
| Puri | Bhel Puri | $3.99 | $5.99 | ⚠️ |
| Tandoori Roti | Tandoori Roti | $2.49 | $2.49 | ✅ |
| Butter Chicken | Butter Chicken | $14.99 | $14.99 | ✅ |
| Chicken Curry | Chicken Curry | $14.99 | $14.99 | ✅ |
| Chicken Korma | Chicken Korma | $14.99 | $14.99 | ✅ |
| Chicken Tikka Masala | Chicken Tikka Masala | $14.99 | $14.99 | ✅ |
| Chicken Vindaloo | Chicken Vindaloo | $14.99 | $14.99 | ✅ |
| Gulab Jamun | Gulab Jamun (2) | $2.99 | $2.99 | ✅ |
| Kheer | Kheer | $3.99 | $3.99 | ✅ |
| Rasmalai | Rasmalai | $4.99 | $4.99 | ✅ |
| Mango Juice | Mango Juice | $3.99 | $3.99 | ✅ |
| Mango Lassi | Mango Lassi | $4.99 | $4.99 | ✅ |
| Salted Lassi | Lassi (Sweet or Salted) | $3.99 | $3.99 | ✅ |
| Sweet Lassi | Lassi (Sweet or Salted) | $3.99 | $3.99 | ✅ |
| Lamb Korma | Lamb Korma | $15.99 | $15.99 | ✅ |
| Lamb Rogan Josh | Rogan Josh | $14.99 | $14.99 | ✅ |
| Lamb Vindaloo | Lamb Vindaloo | $14.99 | $14.99 | ✅ |
| Fish Curry | Fish Curry | $15.99 | $15.99 | ✅ |
| Shrimp Curry | Shrimp Curry | $15.99 | $15.99 | ✅ |
| Chili Paneer | Chilli Paneer | $14.99 | $14.99 | ✅ |
| Vegetable Samosa | Vegetable Samosa (2) | $3.99 | $3.99 | ✅ |
| Chicken Tikka | Chicken Tikka Masala | $14.99 | $14.99 | ✅ |
| Paneer Tikka | Paneer Tikka | $14.99 | $14.99 | ✅ |
| Tandoori Chicken | Tandoori Chicken (Half) | $15.99 | $7.99 | ⚠️ |
| Aloo Gobhi | Aloo Gobhi | $12.99 | $12.99 | ✅ |
| Baingan Bharta | Baingan Bharta | $12.99 | $12.99 | ✅ |
| Malai Kofta | Malai Kofta | $13.99 | $13.99 | ✅ |
| Palak Paneer | Palak Paneer | $12.99 | $12.99 | ✅ |
| Paneer Tikka Masala | Paneer Tikka Masala | $14.99 | $14.99 | ✅ |

## Image Verification Findings
Comparison of prices visible in the menu images against the Excel/HTML data.

### Discrepancies (Image vs Excel/Report)
| Item | Image Price | Excel Price | Notes |
|---|---|---|---|
| **Fish Pakora (1LB)** | **$16.99** | $15.99 | Image price is higher than Excel. |
| **Tandoori Fish** | **$16.99** | $15.99 | Image price is higher than Excel. |

### Clarifications
- **Tandoori Chicken**: Image lists **$7.99/15.99** for Half/Full. The HTML price of $15.99 correctly matches the "Full" price. The warning above identifying it as "Half" with a price mismatch was due to a fuzzy match name collision.
- **Puri**: HTML has "Puri" at $3.99. Report matched it to "Bhel Puri" ($5.99) with a warning. Image confirms **Poori (2)** is **$3.99**. The HTML "Puri" corresponds to "Poori (2)", not "Bhel Puri".

## Items in HTML (Not in Excel)
These items were not found in the Excel file, so their prices were not updated.

- Jeera Rice ($4.49)
- Cheese Naan ($4.99)
- Keema Naan ($6.99)
- Chicken Saag ($14.99)
- Mango Kulfi ($5.99)
- Pistachio Kulfi ($5.99)
- Masala Chai ($2.99)
- Lamb Curry ($14.99)
- Lamb Saag ($14.99)
- Shrimp Masala ($15.99)
- Chili Chicken ($15.99)
- Gobhi Manchurian ($15.79)
- Meat Samosa ($8.49)
- Papadam ($2.99)
- Samosa Chaat ($9.99)
- Mixed Grill ($24.99)
- Seekh Kebab ($14.99)
- Channa Masala ($11.99)
- Dal Fry ($11.99)
- Mixed Vegetable Curry ($11.99)

## Items in Excel (Not in HTML)
These items exist in the Excel file but could not be matched to an item in `menu.html`.

- Aloo Tikki Chana ($7.99)
- Samosa Chana ($9.99)
- Pakora (Gobhi, Aloo, Mix Veg, Chilli) 1LB ($9.99)
- Paneer Pakora 1LB ($13.99)
- Pani Puri (6) ($5.99)
- Sev Puri (5) ($7.99)
- Aloo Chaat ($9.99)
- Chole Bhature ($10.99)
- Fish Pakora (1LB) ($15.99)
- Tandoori Fish ($15.99)
- Chicken Pakora ($13.99)
- Tandoori Chicken (Full) ($15.99)
- Amritsari Naan ($4.49)
- Paneer Naan ($4.99)
- Tava Roti ($2.49)
- Bhatura ($2.49)
- Poori (2) ($3.99)
- Onion Kulcha ($3.99)
- Palak Chicken ($14.99)
- Karahi Chicken ($14.99)
- Chicken Fiji ($14.99)
- Fish Vindaloo ($15.99)
- Karahi Fish ($15.99)
- Shrimp Vindaloo ($15.99)
- Shrimp Korma ($15.99)
- Palak Lamb ($14.99)
- Karahi Lamb ($14.99)
- Goat Curry ($15.99)
- Goat Leg Soup ($13.99)
- Dal Punjabi ($11.99)
- Mattar Paneer ($12.99)
- Shahi Paneer ($13.99)
- Karahi Paneer ($13.99)
- Palak Aloo ($11.99)
- Chana Masala ($11.99)
- Mix Veg ($11.99)
- Navratan Korma ($12.99)
- Bhindi Masala ($12.99)
- Paneer Bhurji ($13.99)
- Cucumber Raita ($4.99)
- Plain Yogurt ($3.99)
- Pappad ($2.99)
- Fresh Green Salad ($3.99)
- Soft Drink ($1.99)
- Bottled Soda ($3.99)
- Tea ($2.99)
- Small Beer ($4.99)
- Large Beer ($9.99)
- Wine Glass ($5.99)
- Special Vegetable Thali ($12.99)

INSERT INTO currencies (code, name, minor_unit, enabled) VALUES
('USD','US Dollar',2,TRUE),('EUR','Euro',2,TRUE),('JPY','Japanese Yen',0,TRUE),
('GBP','Pound Sterling',2,TRUE),('CNY','Chinese Yuan',2,TRUE),('CHF','Swiss Franc',2,TRUE),('NGN','Nigerian Naira',2,TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), minor_unit=VALUES(minor_unit);

INSERT INTO countries (code, name, default_currency_code, enabled) VALUES
('US','United States','USD',FALSE),('GB','United Kingdom','GBP',FALSE),
('JP','Japan','JPY',FALSE),('CN','China','CNY',FALSE),('CH','Switzerland','CHF',FALSE),
('NG','Nigeria','NGN',FALSE),('DE','Germany','EUR',FALSE),('FR','France','EUR',FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name), default_currency_code=VALUES(default_currency_code);

INSERT INTO country_currencies (country_code,currency_code,usage_type,enabled)
SELECT co.code, cu.code, CASE WHEN co.default_currency_code = cu.code THEN 'local' ELSE 'global' END, FALSE
FROM countries co CROSS JOIN currencies cu
WHERE cu.code IN ('USD','EUR','JPY','GBP','CNY','CHF')
ON DUPLICATE KEY UPDATE usage_type=VALUES(usage_type);

INSERT INTO country_currencies (country_code,currency_code,usage_type,enabled)
SELECT code, default_currency_code, 'local', FALSE FROM countries
WHERE default_currency_code IS NOT NULL
ON DUPLICATE KEY UPDATE usage_type=VALUES(usage_type);

INSERT INTO loan_categories (code,name,display_order) VALUES
('personal-consumer','Personal & Consumer Loans',1),('education','Education Loans',2),
('medical-healthcare','Medical & Healthcare Loans',3),('vehicle-transport','Vehicle & Transport Loans',4),
('home-mortgage','Home & Mortgage Loans',5),('real-estate-property','Real Estate & Property Loans',6),
('construction-development','Construction & Development Loans',7),('short-term-bridge','Short-Term & Bridge Loans',8),
('general-business','General Business Loans',9),('commercial','Commercial Loans',10),
('government-backed','Government-Backed Loans',11),('equipment-asset','Equipment & Asset Financing',12),
('revolving-credit','Revolving & Flexible Credit',13),('receivables-trade','Receivables & Trade Finance',14),
('agricultural','Agricultural Loans',15),('energy-natural-resources','Energy & Natural Resource Loans',16),
('community-microfinance','Community & Microfinance Loans',17),('collateral-based','Collateral-Based Loans',18),
('special-condition','Special Condition Loans',19)
ON DUPLICATE KEY UPDATE name=VALUES(name), display_order=VALUES(display_order);

INSERT INTO loan_product_types (category_id,code,name)
SELECT c.id, x.code, x.name FROM (
 SELECT 'personal-consumer' category_code,'personal-loan' code,'Personal loan' name UNION ALL
 SELECT 'personal-consumer','debt-repayment-loan','Debt repayment loan' UNION ALL
 SELECT 'personal-consumer','credit-builder-loan','Credit builder loan' UNION ALL
 SELECT 'personal-consumer','payday-loan','Payday loan' UNION ALL
 SELECT 'education','educational-loan','Educational loan' UNION ALL
 SELECT 'education','federal-student-loan','Federal student loan' UNION ALL
 SELECT 'education','private-student-loan','Private student loan' UNION ALL
 SELECT 'education','parent-loan','Parent loan' UNION ALL
 SELECT 'education','student-loan-refinance','Student loan refinance' UNION ALL
 SELECT 'medical-healthcare','medical-loan','Medical loan' UNION ALL
 SELECT 'medical-healthcare','dental-cosmetic-financing','Dental or cosmetic financing' UNION ALL
 SELECT 'medical-healthcare','medical-equipment-loan','Medical equipment loan' UNION ALL
 SELECT 'vehicle-transport','auto-loan','Auto loan' UNION ALL
 SELECT 'vehicle-transport','motorcycle-loan','Motorcycle loan' UNION ALL
 SELECT 'vehicle-transport','boat-rv-loan','Boat or RV loan' UNION ALL
 SELECT 'vehicle-transport','fleet-financing','Fleet financing' UNION ALL
 SELECT 'home-mortgage','mortgage-loan','Mortgage loan' UNION ALL
 SELECT 'home-mortgage','home-equity-loan','Home equity loan' UNION ALL
 SELECT 'home-mortgage','heloc','Home equity line of credit (HELOC)' UNION ALL
 SELECT 'home-mortgage','refinance-loan','Refinance loan' UNION ALL
 SELECT 'home-mortgage','fha-va-loan','FHA/VA loan' UNION ALL
 SELECT 'real-estate-property','real-estate-loan','Real estate loan' UNION ALL
 SELECT 'real-estate-property','rental-property-loan','Rental property loan' UNION ALL
 SELECT 'real-estate-property','land-loan','Land loan' UNION ALL
 SELECT 'real-estate-property','fix-and-flip-loan','Fix-and-flip loan' UNION ALL
 SELECT 'construction-development','construction-loan','Construction loan' UNION ALL
 SELECT 'construction-development','renovation-loan','Renovation loan' UNION ALL
 SELECT 'construction-development','developer-loan','Developer loan' UNION ALL
 SELECT 'short-term-bridge','bridge-loan','Bridge loan' UNION ALL
 SELECT 'short-term-bridge','hard-money-loan','Hard money loan' UNION ALL
 SELECT 'short-term-bridge','short-term-loan','Short-term loan' UNION ALL
 SELECT 'general-business','business-loan','Business loan' UNION ALL
 SELECT 'general-business','startup-loan','Startup loan' UNION ALL
 SELECT 'general-business','working-capital-loan','Working capital loan' UNION ALL
 SELECT 'general-business','term-loan','Term loan' UNION ALL
 SELECT 'commercial','commercial-loan','Commercial loan' UNION ALL
 SELECT 'commercial','commercial-real-estate-loan','Commercial real estate loan' UNION ALL
 SELECT 'commercial','commercial-mortgage','Commercial mortgage' UNION ALL
 SELECT 'government-backed','sba-loan','SBA loan' UNION ALL
 SELECT 'government-backed','usda-business-loan','USDA business loan' UNION ALL
 SELECT 'government-backed','disaster-relief-loan','Disaster relief loan' UNION ALL
 SELECT 'equipment-asset','equipment-financing','Equipment financing' UNION ALL
 SELECT 'equipment-asset','equipment-leasing','Equipment leasing' UNION ALL
 SELECT 'equipment-asset','machinery-loan','Machinery loan' UNION ALL
 SELECT 'revolving-credit','line-of-credit','Line of credit' UNION ALL
 SELECT 'revolving-credit','business-credit-card','Business credit card' UNION ALL
 SELECT 'revolving-credit','overdraft-facility','Overdraft facility' UNION ALL
 SELECT 'receivables-trade','invoice-financing','Invoice financing' UNION ALL
 SELECT 'receivables-trade','factoring','Factoring' UNION ALL
 SELECT 'receivables-trade','purchase-order-financing','Purchase order financing' UNION ALL
 SELECT 'receivables-trade','letter-of-credit','Letter of credit' UNION ALL
 SELECT 'agricultural','agricultural-loan','Agricultural loan' UNION ALL
 SELECT 'agricultural','farmland-loan','Farmland loan' UNION ALL
 SELECT 'agricultural','farm-equipment-loan','Farm equipment loan' UNION ALL
 SELECT 'agricultural','livestock-loan','Livestock loan' UNION ALL
 SELECT 'energy-natural-resources','oil-and-gas-loan','Oil and gas loan' UNION ALL
 SELECT 'energy-natural-resources','mining-loan','Mining loan' UNION ALL
 SELECT 'energy-natural-resources','renewable-energy-loan','Solar or renewable energy loan' UNION ALL
 SELECT 'community-microfinance','microloan','Microloan' UNION ALL
 SELECT 'community-microfinance','group-lending','Group lending' UNION ALL
 SELECT 'community-microfinance','nonprofit-church-loan','Nonprofit or church loan' UNION ALL
 SELECT 'collateral-based','title-loan','Title loan' UNION ALL
 SELECT 'collateral-based','pawn-loan','Pawn loan' UNION ALL
 SELECT 'collateral-based','margin-loan','Margin loan' UNION ALL
 SELECT 'collateral-based','life-insurance-policy-loan','Life insurance policy loan' UNION ALL
 SELECT 'special-condition','special-condition-loan','Special condition loan'
) x JOIN loan_categories c ON c.code=x.category_code
ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id);

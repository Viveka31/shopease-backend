/**
 * ShopEase — Seed Script
 * Creates: 1 admin seller, 2 demo buyers, 50 fashion products
 * Run: npm run seed   (from backend/ folder)
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User    = require('./models/User');
const Product = require('./models/Product');

// ─── Unsplash fashion image pools ────────────────────────────────────────────
const MENS    = [
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
  'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
];
const WOMENS  = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&q=80',
];
const KIDS    = [
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80',
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
];
const ACCESS  = [
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
];
const SHOES   = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80',
];
const ACTIVE  = [
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80',
];

const r  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rn = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Product data ─────────────────────────────────────────────────────────────
const buildProducts = (sellerId) => [
  // ── MEN'S CLOTHING (12) ──────────────────────────────────────────────────
  { name: 'Classic White Oxford Shirt',          price:1299,discountPrice:999,  category:"Men's Clothing",brand:'ClassicWear',  images:[MENS[0],MENS[1]], sizes:['S','M','L','XL','XXL'], colors:['White','Light Blue','Navy'],        stock:80, sold:245, rating:4.5, numReviews:89,  isFeatured:true,  tags:['shirt','formal','cotton','classic'],        description:'A timeless wardrobe essential crafted from premium 100% cotton fabric. Features a button-down collar, classic cuffs, and a tailored fit that works from office to weekend.' },
  { name: 'Slim Fit Chino Trousers',             price:1799,discountPrice:1399, category:"Men's Clothing",brand:'UrbanFit',    images:[MENS[1]],          sizes:['S','M','L','XL'],       colors:['Khaki','Navy','Olive','Black'],      stock:60, sold:178, rating:4.3, numReviews:64,  isFeatured:true,  tags:['trousers','chino','slim','casual'],           description:'Modern slim-fit chinos made from a premium stretch cotton blend. Perfect for smart-casual occasions with a silhouette that keeps you looking polished all day.' },
  { name: 'Oversized Graphic Hoodie',            price:1599,discountPrice:0,    category:"Men's Clothing",brand:'StreetVibe',  images:[MENS[2]],          sizes:['S','M','L','XL','XXL'], colors:['Black','Grey','Navy','Maroon'],      stock:120,sold:567, rating:4.4, numReviews:178, isFeatured:false, tags:['hoodie','oversized','streetwear','casual'],  description:'Ultra-soft fleece hoodie with a relaxed oversized fit. Features ribbed cuffs, kangaroo pocket, and a drawstring hood. The ultimate companion for casual days.' },
  { name: 'Slim Fit Formal Blazer',              price:4999,discountPrice:3799, category:"Men's Clothing",brand:'SuitUp',      images:[MENS[3]],          sizes:['S','M','L','XL'],       colors:['Charcoal','Navy','Black'],           stock:35, sold:89,  rating:4.6, numReviews:42,  isFeatured:true,  tags:['blazer','formal','slim','office'],            description:'Sharp and sophisticated slim-fit blazer crafted from a poly-viscose blend. Two-button front, notch lapel, and structured shoulders for a powerful silhouette.' },
  { name: 'Relaxed Fit Linen Shirt',             price:1199,discountPrice:899,  category:"Men's Clothing",brand:'LinenLux',   images:[MENS[4]],          sizes:['S','M','L','XL','XXL'], colors:['White','Beige','Sky Blue','Sage'],   stock:75, sold:312, rating:4.2, numReviews:97,  isFeatured:false, tags:['shirt','linen','summer','casual','relaxed'],  description:'Breathable linen shirt perfect for warm weather. The relaxed fit and soft texture make it ideal for beach trips, brunches, or casual Fridays at the office.' },
  { name: 'Cargo Jogger Pants',                  price:1399,discountPrice:1099, category:"Men's Clothing",brand:'UrbanFit',   images:[MENS[5]],          sizes:['S','M','L','XL'],       colors:['Olive','Black','Khaki'],             stock:90, sold:234, rating:4.1, numReviews:78,  isFeatured:false, tags:['jogger','cargo','pants','casual','streetwear'],description:'Versatile cargo joggers with multiple pockets and a tapered leg. Elastic waistband with drawstring for the perfect fit. Combines utility with style effortlessly.' },
  { name: 'Polo T-Shirt Pique Cotton',           price:999, discountPrice:749,  category:"Men's Clothing",brand:'ClassicWear', images:[MENS[6]],         sizes:['S','M','L','XL','XXL'], colors:['White','Navy','Red','Green','Black'],stock:150,sold:456, rating:4.5, numReviews:189, isFeatured:true,  tags:['polo','tshirt','cotton','casual'],            description:'Classic pique cotton polo shirt with a two-button placket and ribbed collar. A wardrobe staple that pairs effortlessly with chinos or jeans for a put-together look.' },
  { name: 'Denim Jacket — Classic Fit',          price:2999,discountPrice:2299, category:"Men's Clothing",brand:'DenimCo',    images:[MENS[7]],          sizes:['S','M','L','XL'],       colors:['Light Wash','Dark Wash','Black'],    stock:45, sold:167, rating:4.4, numReviews:63,  isFeatured:false, tags:['jacket','denim','casual','layering'],         description:'Iconic denim jacket in a classic fit with button closure and chest pockets. Made from 100% cotton denim that gets better with every wash and wear.' },
  { name: 'Printed Casual Shirt',                price:899, discountPrice:699,  category:"Men's Clothing",brand:'PrintPlus',  images:[MENS[0]],          sizes:['S','M','L','XL','XXL'], colors:['Multi-Blue','Multi-Green'],          stock:110,sold:289, rating:4.0, numReviews:112, isFeatured:false, tags:['shirt','printed','casual','fun'],             description:'Vibrant printed casual shirt in a relaxed fit. Perfect for weekend outings, vacations, or any occasion that calls for a pop of color and personality.' },
  { name: 'Classic Black Trousers',              price:1599,discountPrice:0,    category:"Men's Clothing",brand:'SuitUp',      images:[MENS[1]],         sizes:['S','M','L','XL'],       colors:['Black','Charcoal','Navy'],           stock:65, sold:198, rating:4.3, numReviews:54,  isFeatured:false, tags:['trousers','formal','office','classic'],       description:'Well-tailored formal trousers in a mid-rise straight fit. Crafted from a wrinkle-resistant fabric that keeps you looking sharp from morning meetings to evening events.' },
  { name: 'Graphic Print Round Neck T-Shirt',    price:599, discountPrice:449,  category:"Men's Clothing",brand:'StreetVibe', images:[MENS[2]],          sizes:['S','M','L','XL','XXL'], colors:['White','Black','Grey'],              stock:200,sold:678, rating:4.2, numReviews:234, isFeatured:false, tags:['tshirt','graphic','casual','streetwear'],    description:'Bold graphic print t-shirt in soft cotton. The relaxed round-neck cut and artistic design make it a statement piece for any casual wardrobe.' },
  { name: 'Knitted Crew Neck Sweater',           price:1899,discountPrice:1499, category:"Men's Clothing",brand:'WarmWear',   images:[MENS[3]],          sizes:['S','M','L','XL'],       colors:['Camel','Navy','Grey','Burgundy'],   stock:55, sold:143, rating:4.5, numReviews:67,  isFeatured:true,  tags:['sweater','knit','winter','classic'],          description:'Warm and stylish knitted crew neck sweater in a regular fit. Made from a soft wool-blend fabric that provides warmth without bulk. A cold-weather essential.' },

  // ── WOMEN'S CLOTHING (12) ────────────────────────────────────────────────
  { name: 'Floral Wrap Midi Dress',              price:2499,discountPrice:1799, category:"Women's Clothing",brand:'BloomStyle', images:[WOMENS[0],WOMENS[4]], sizes:['XS','S','M','L','XL'], colors:['Floral Pink','Floral Blue','Floral Yellow'],stock:45,sold:312,rating:4.8,numReviews:134,isFeatured:true, tags:['dress','floral','midi','summer','feminine'],  description:'Effortlessly elegant floral wrap dress perfect for any occasion. Made from lightweight viscose that drapes beautifully. Adjustable waist tie creates a flattering silhouette.' },
  { name: 'High-Rise Skinny Jeans',             price:1999,discountPrice:1499, category:"Women's Clothing",brand:'DenimCo',    images:[WOMENS[1]],          sizes:['XS','S','M','L','XL'], colors:['Light Wash','Dark Wash','Black'],    stock:90, sold:421, rating:4.6, numReviews:203, isFeatured:true,  tags:['jeans','denim','skinny','high-rise'],         description:'Ultimate fit high-rise skinny jeans with premium stretch denim. The sculpting design provides a flattering silhouette that lengthens the leg and hugs every curve.' },
  { name: 'Silk Satin Blouse',                  price:2199,discountPrice:1699, category:"Women's Clothing",brand:'SilkLux',    images:[WOMENS[2]],          sizes:['XS','S','M','L'],      colors:['Ivory','Blush Pink','Sage Green','Slate Blue'],stock:40,sold:189,rating:4.6,numReviews:87,isFeatured:false,tags:['blouse','satin','silk','workwear','elegant'],description:'Luxurious satin blouse with a relaxed fit and delicate button detailing. Pairs beautifully with tailored trousers or jeans for effortless elegance.' },
  { name: 'A-Line Pleated Skirt',               price:1299,discountPrice:999,  category:"Women's Clothing",brand:'BloomStyle', images:[WOMENS[3]],          sizes:['XS','S','M','L'],      colors:['Black','Cream','Dusty Rose','Sage'], stock:65, sold:267, rating:4.5, numReviews:98,  isFeatured:false, tags:['skirt','a-line','pleated','feminine','midi'], description:'Graceful A-line pleated skirt with an elastic waistband for comfort. The flowing silhouette makes it perfect for work, brunch, or evening outings.' },
  { name: 'Cropped Knit Cardigan',              price:1599,discountPrice:1199, category:"Women's Clothing",brand:'WarmWear',   images:[WOMENS[4]],          sizes:['XS','S','M','L','XL'], colors:['Cream','Pink','Brown','Black'],      stock:80, sold:334, rating:4.7, numReviews:145, isFeatured:true,  tags:['cardigan','knit','cropped','layering'],       description:'Cozy cropped knit cardigan with button closure and ribbed trim. Pairs perfectly with high-waist bottoms for a stylish, put-together look any season.' },
  { name: 'Strappy Maxi Dress',                 price:2799,discountPrice:2199, category:"Women's Clothing",brand:'BloomStyle', images:[WOMENS[5]],          sizes:['XS','S','M','L'],      colors:['Terracotta','Cobalt Blue','Black'],  stock:38, sold:189, rating:4.7, numReviews:76,  isFeatured:true,  tags:['dress','maxi','strappy','boho','summer'],     description:'Flowy strappy maxi dress with a V-neckline and side slit. Crafted from breathable fabric that moves beautifully. Perfect for beach days, vacations, and summer events.' },
  { name: 'Wide Leg Linen Trousers',            price:1699,discountPrice:1299, category:"Women's Clothing",brand:'LinenLux',   images:[WOMENS[6]],          sizes:['XS','S','M','L','XL'], colors:['White','Beige','Sage','Black'],      stock:55, sold:234, rating:4.4, numReviews:89,  isFeatured:false, tags:['trousers','linen','wide-leg','summer','casual'],description:'Chic wide-leg linen trousers with an elastic waistband and side pockets. Effortlessly stylish and comfortable for warm-weather dressing.' },
  { name: 'Off-Shoulder Ruffle Blouse',         price:1099,discountPrice:849,  category:"Women's Clothing",brand:'FrillFest',  images:[WOMENS[7]],          sizes:['XS','S','M','L'],      colors:['White','Yellow','Red'],             stock:70, sold:312, rating:4.3, numReviews:112, isFeatured:false, tags:['blouse','off-shoulder','ruffle','feminine'],  description:'Romantic off-shoulder ruffle blouse in soft fabric. The tiered ruffle detailing adds volume and femininity, making it perfect for date nights and special occasions.' },
  { name: 'Bodycon Mini Dress',                 price:1799,discountPrice:1399, category:"Women's Clothing",brand:'NightOut',   images:[WOMENS[0]],          sizes:['XS','S','M','L'],      colors:['Black','Red','Emerald'],            stock:50, sold:289, rating:4.5, numReviews:134, isFeatured:false, tags:['dress','mini','bodycon','party','night'],     description:'Sleek bodycon mini dress with stretchy fabric that contours to your figure. A statement piece for parties, nights out, or any occasion that calls for confidence.' },
  { name: 'Relaxed Fit Utility Jacket',         price:2499,discountPrice:1899, category:"Women's Clothing",brand:'UrbanFit',   images:[WOMENS[1]],          sizes:['XS','S','M','L','XL'], colors:['Olive','Beige','Black'],            stock:42, sold:156, rating:4.4, numReviews:58,  isFeatured:false, tags:['jacket','utility','casual','layering'],       description:'Relaxed utility jacket with multiple pockets and a belted waist. The washed cotton fabric gives it an effortlessly cool, lived-in look.' },
  { name: 'Tie-Dye Oversized Tee',              price:799, discountPrice:599,  category:"Women's Clothing",brand:'StreetVibe', images:[WOMENS[2]],          sizes:['XS','S','M','L','XL'], colors:['Purple Tie-Dye','Blue Tie-Dye','Pink Tie-Dye'],stock:100,sold:445,rating:4.3,numReviews:167,isFeatured:false,tags:['tshirt','tie-dye','oversized','casual','fun'],description:'Fun tie-dye oversized tee in soft cotton. Each piece has a unique pattern, making it a one-of-a-kind addition to your casual wardrobe.' },
  { name: 'Pleated Midi Wrap Skirt',            price:1499,discountPrice:1099, category:"Women's Clothing",brand:'BloomStyle', images:[WOMENS[3]],          sizes:['XS','S','M','L'],      colors:['Floral','Leopard Print','Solid Black'],stock:60,sold:278,rating:4.6,numReviews:103,isFeatured:true, tags:['skirt','midi','wrap','pleated'],              description:'Elegant pleated midi wrap skirt with a self-tie belt. The fluid fabric creates a beautiful drape and the adjustable tie ensures a perfect fit for all body types.' },

  // ── KIDS' CLOTHING (6) ──────────────────────────────────────────────────
  { name: "Kids' Dinosaur Print Tee",           price:699, discountPrice:499,  category:"Kids' Clothing",brand:'KiddoWear',  images:[KIDS[0]],            sizes:['XS','S','M'],          colors:['Green','Yellow','Orange'],          stock:200,sold:389, rating:4.9, numReviews:267, isFeatured:false, tags:['kids','tshirt','dinosaur','cotton','fun'],    description:'Fun and colorful dinosaur print t-shirt for kids. Made from 100% organic cotton for soft, skin-friendly wear. Easy care and machine washable.' },
  { name: "Kids' Puffer Jacket",                price:1799,discountPrice:1299, category:"Kids' Clothing",brand:'KiddoWear',  images:[KIDS[1]],            sizes:['XS','S','M'],          colors:['Red','Blue','Pink','Green'],        stock:80, sold:234, rating:4.8, numReviews:112, isFeatured:false, tags:['kids','jacket','puffer','winter','warm'],     description:'Warm and cozy puffer jacket for kids with a water-resistant outer shell. Features a full zip, hood, and zip pockets. Perfect for winter adventures.' },
  { name: "Kids' Floral Summer Dress",          price:899, discountPrice:699,  category:"Kids' Clothing",brand:'LittleBloom',images:[KIDS[0]],            sizes:['XS','S','M'],          colors:['Pink Floral','Blue Floral'],        stock:120,sold:198, rating:4.7, numReviews:89,  isFeatured:false, tags:['kids','dress','floral','summer','girls'],     description:'Sweet and cheerful floral summer dress for girls. Soft cotton fabric with a smocked bodice and flutter sleeves. Easy to wear and even easier to love.' },
  { name: "Kids' Cargo Shorts",                 price:599, discountPrice:449,  category:"Kids' Clothing",brand:'KiddoWear',  images:[KIDS[1]],            sizes:['XS','S','M'],          colors:['Khaki','Navy','Olive'],             stock:150,sold:312, rating:4.6, numReviews:134, isFeatured:false, tags:['kids','shorts','cargo','boys','casual'],      description:'Durable cargo shorts for active kids. Multiple pockets for all their treasures, elastic waistband with adjustable drawstring for a comfortable fit all day.' },
  { name: "Kids' Striped Polo Shirt",           price:549, discountPrice:399,  category:"Kids' Clothing",brand:'LittleBloom',images:[KIDS[0]],            sizes:['XS','S','M'],          colors:['Navy/White','Red/White','Green/White'],stock:180,sold:267,rating:4.5,numReviews:98,isFeatured:false,tags:['kids','polo','striped','casual','boys'],       description:'Classic striped polo shirt for kids in soft pique cotton. The ribbed collar and cuffs ensure durability while the fun stripes add personality to any outfit.' },
  { name: "Kids' Rainbow Leggings",             price:499, discountPrice:0,    category:"Kids' Clothing",brand:'KiddoWear',  images:[KIDS[1]],            sizes:['XS','S','M'],          colors:['Rainbow','Purple','Pink'],          stock:200,sold:445, rating:4.9, numReviews:189, isFeatured:false, tags:['kids','leggings','rainbow','girls','fun'],    description:'Bright and stretchy rainbow leggings for girls. Made from soft 4-way stretch fabric that moves with your child. Great for school, play, or lounging.' },

  // ── ACCESSORIES (8) ─────────────────────────────────────────────────────
  { name: 'Leather Crossbody Bag',              price:3499,discountPrice:2799, category:'Accessories',brand:'LuxeCarry',  images:[ACCESS[0]],          sizes:['Free Size'],           colors:['Tan','Black','Burgundy'],           stock:35, sold:156, rating:4.7, numReviews:92,  isFeatured:true,  tags:['bag','leather','crossbody','accessory'],      description:'Genuine leather crossbody bag with gold-tone hardware. Features multiple compartments, adjustable strap, and zip closure. Timeless style meets everyday functionality.' },
  { name: 'Classic Leather Belt',               price:899, discountPrice:699,  category:'Accessories',brand:'BeltCraft',  images:[ACCESS[1]],          sizes:['Free Size'],           colors:['Black','Brown','Tan'],              stock:100,sold:345, rating:4.5, numReviews:134, isFeatured:false, tags:['belt','leather','accessory','classic'],       description:'Genuine leather belt with a polished silver buckle. Vegetable-tanned leather develops a beautiful patina over time. Available in multiple widths and colors.' },
  { name: 'Silk Scarf — Heritage Print',        price:1299,discountPrice:999,  category:'Accessories',brand:'SilkLux',    images:[ACCESS[2]],          sizes:['Free Size'],           colors:['Blue Heritage','Red Heritage','Green Heritage'],stock:60,sold:189,rating:4.8,numReviews:76,isFeatured:false,tags:['scarf','silk','accessory','heritage'],         description:'Luxurious silk scarf with a classic heritage print. Wear it as a headband, around your neck, or tied to your bag handle for an instant touch of elegance.' },
  { name: 'Canvas Tote Bag',                    price:699, discountPrice:499,  category:'Accessories',brand:'CarryMore',  images:[ACCESS[0]],          sizes:['Free Size'],           colors:['Natural','Black','Navy'],           stock:150,sold:456, rating:4.4, numReviews:178, isFeatured:false, tags:['bag','tote','canvas','eco','casual'],         description:'Heavy-duty canvas tote bag with reinforced handles and a zip inner pocket. Eco-friendly and spacious enough for groceries, gym gear, or a day at the beach.' },
  { name: 'Aviator Sunglasses — UV400',         price:1499,discountPrice:999,  category:'Accessories',brand:'ShadeCo',    images:[ACCESS[1]],          sizes:['Free Size'],           colors:['Gold/Brown','Silver/Grey','Black'],  stock:80, sold:234, rating:4.6, numReviews:89,  isFeatured:true,  tags:['sunglasses','aviator','UV400','accessory'],   description:'Classic aviator sunglasses with UV400 protection and polarized lenses. The lightweight metal frame and adjustable nose pads ensure all-day comfort and style.' },
  { name: 'Structured Laptop Backpack',         price:2999,discountPrice:2399, category:'Accessories',brand:'CarryMore',  images:[ACCESS[2]],          sizes:['Free Size'],           colors:['Black','Navy','Grey'],              stock:55, sold:167, rating:4.7, numReviews:63,  isFeatured:false, tags:['backpack','laptop','bag','work','travel'],    description:'Ergonomic laptop backpack with a padded 15-inch laptop sleeve, multiple organization pockets, and a USB charging port. Built for the modern professional.' },
  { name: 'Beaded Statement Necklace',          price:799, discountPrice:599,  category:'Accessories',brand:'JewelPlus',  images:[ACCESS[0]],          sizes:['Free Size'],           colors:['Gold/Multi','Silver/Multi','Black/Multi'],stock:90,sold:312,rating:4.5,numReviews:112,isFeatured:false,tags:['necklace','jewelry','beaded','statement'],     description:'Bold beaded statement necklace that elevates any outfit. Handcrafted with colorful beads and a secure lobster clasp. A conversation starter for any occasion.' },
  { name: 'Wide Brim Straw Hat',                price:999, discountPrice:749,  category:'Accessories',brand:'SunShade',   images:[ACCESS[1]],          sizes:['Free Size'],           colors:['Natural','Black','Camel'],          stock:70, sold:245, rating:4.6, numReviews:87,  isFeatured:false, tags:['hat','straw','summer','beach','accessory'],   description:'Classic wide-brim straw hat for sun protection and effortless style. The adjustable inner band ensures a comfortable fit, making it perfect for beach days and outdoor events.' },

  // ── FOOTWEAR (6) ────────────────────────────────────────────────────────
  { name: 'Running Sneakers Pro',               price:4999,discountPrice:3999, category:'Footwear',brand:'SpeedStep',  images:[SHOES[0]],           sizes:['S','M','L','XL'],      colors:['White/Blue','Black/Red','Grey/Green'],stock:55,sold:234,rating:4.5,numReviews:145,isFeatured:true, tags:['shoes','sneakers','running','sports'],         description:'High-performance running sneakers with cushioned sole and breathable mesh upper. Engineered for maximum comfort during long runs or everyday wear.' },
  { name: 'Classic White Sneakers',             price:2999,discountPrice:2299, category:'Footwear',brand:'PureStep',   images:[SHOES[1]],           sizes:['S','M','L','XL'],      colors:['White','Off-White'],                stock:80, sold:389, rating:4.7, numReviews:203, isFeatured:true,  tags:['shoes','sneakers','white','casual','classic'], description:'Timeless clean white sneakers with a vulcanized rubber sole. The minimalist leather-look upper goes with absolutely everything in your wardrobe.' },
  { name: 'Ankle Strap Block Heels',            price:2499,discountPrice:1899, category:'Footwear',brand:'HeelStyle',  images:[SHOES[2]],           sizes:['XS','S','M','L'],      colors:['Nude','Black','Red'],               stock:45, sold:167, rating:4.4, numReviews:78,  isFeatured:false, tags:['heels','block','ankle-strap','women','party'], description:'Elegant block heel sandals with a secure ankle strap. The stable heel makes them comfortable enough to dance in all night. A versatile addition to any wardrobe.' },
  { name: 'Leather Oxford Shoes',               price:3499,discountPrice:2799, category:'Footwear',brand:'ClassicWear',images:[SHOES[0]],           sizes:['S','M','L','XL'],      colors:['Dark Brown','Black','Tan'],         stock:40, sold:134, rating:4.6, numReviews:56,  isFeatured:false, tags:['shoes','oxford','leather','formal','men'],     description:'Handcrafted leather oxford shoes with a Goodyear-welted sole for exceptional durability. The classic cap-toe design works for business meetings and black-tie events alike.' },
  { name: 'Slip-On Mule Sandals',               price:1699,discountPrice:1299, category:'Footwear',brand:'SoleEase',   images:[SHOES[1]],           sizes:['XS','S','M','L'],      colors:['Beige','Black','White'],            stock:70, sold:298, rating:4.3, numReviews:112, isFeatured:false, tags:['sandals','mule','slip-on','summer','women'],  description:'Chic slip-on mule sandals with a cushioned insole and easy slide-on design. The versatile silhouette transitions effortlessly from casual to smart-casual occasions.' },
  { name: 'High-Top Canvas Sneakers',           price:1999,discountPrice:1499, category:'Footwear',brand:'StreetVibe', images:[SHOES[2]],           sizes:['S','M','L','XL'],      colors:['Black','White','Red','Navy'],       stock:90, sold:456, rating:4.5, numReviews:167, isFeatured:false, tags:['sneakers','high-top','canvas','streetwear'],  description:'Iconic high-top canvas sneakers with a vulcanized rubber sole and metal eyelets. The classic silhouette has been a streetwear staple for decades and shows no signs of stopping.' },

  // ── ACTIVEWEAR (6) ──────────────────────────────────────────────────────
  { name: 'High Waist Yoga Leggings',           price:1399,discountPrice:999,  category:'Activewear',brand:'FlexFit',   images:[ACTIVE[0]],          sizes:['XS','S','M','L','XL'], colors:['Black','Navy','Burgundy','Teal'],   stock:110,sold:678, rating:4.7, numReviews:312, isFeatured:false, tags:['yoga','leggings','activewear','fitness'],     description:'Four-way stretch yoga leggings with moisture-wicking fabric and a high waist design. Hidden pocket, squat-proof, and fade resistant — your perfect workout companion.' },
  { name: 'Sports Performance Jacket',          price:2999,discountPrice:2299, category:'Activewear',brand:'TrackPro',  images:[ACTIVE[1]],          sizes:['S','M','L','XL','XXL'], colors:['Black','Navy','Red','Grey'],       stock:65, sold:143, rating:4.4, numReviews:76,  isFeatured:true,  tags:['jacket','sports','activewear','windproof'],   description:'Lightweight windproof jacket with moisture-wicking lining. Packable design fits in its own pocket. Perfect for outdoor runs, gym sessions, or casual wear.' },
  { name: 'Seamless Sports Bra',                price:799, discountPrice:599,  category:'Activewear',brand:'FlexFit',   images:[ACTIVE[2]],          sizes:['XS','S','M','L'],      colors:['Black','White','Lilac','Mint'],     stock:130,sold:567, rating:4.6, numReviews:234, isFeatured:false, tags:['sports bra','seamless','activewear','yoga'],  description:'Seamless medium-impact sports bra with moisture-wicking fabric and a racerback design. Wide underband provides support while the seamless construction eliminates chafing.' },
  { name: 'Athletic Dry-Fit T-Shirt',           price:699, discountPrice:499,  category:'Activewear',brand:'TrackPro',  images:[ACTIVE[0]],          sizes:['S','M','L','XL','XXL'], colors:['Black','White','Blue','Red'],      stock:180,sold:445, rating:4.3, numReviews:178, isFeatured:false, tags:['tshirt','sports','dry-fit','gym','running'],  description:'Lightweight dry-fit t-shirt with moisture-wicking technology that keeps you cool and dry during intense workouts. Raglan sleeves allow unrestricted movement.' },
  { name: 'Compression Running Shorts',         price:999, discountPrice:749,  category:'Activewear',brand:'FlexFit',   images:[ACTIVE[1]],          sizes:['XS','S','M','L','XL'], colors:['Black','Navy','Grey'],             stock:100,sold:334, rating:4.5, numReviews:134, isFeatured:false, tags:['shorts','running','compression','sports'],    description:'Compression running shorts with a 5-inch inseam and built-in liner. Elastic waistband with internal drawstring and a rear zip pocket for your essentials.' },
  { name: 'Zip-Up Training Hoodie',             price:1599,discountPrice:1199, category:'Activewear',brand:'TrackPro',  images:[ACTIVE[2]],          sizes:['S','M','L','XL','XXL'], colors:['Black','Grey','Navy'],             stock:75, sold:267, rating:4.4, numReviews:98,  isFeatured:false, tags:['hoodie','training','zip','activewear','gym'],description:'Zip-up training hoodie with a fleece-lined interior for post-workout warmth. Kangaroo pocket, thumb holes, and a snug fit that keeps you moving comfortably.' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users
  const seller = await User.create({
    name: 'ShopEase Official',
    email: 'seller@shopease.com',
    password: 'seller123',
    role: 'seller',
    isVerified: true,
  });
  await User.create({ name: 'Demo Buyer', email: 'buyer@shopease.com',  password: 'buyer123',  role: 'buyer', isVerified: true });
  await User.create({ name: 'Test User',  email: 'test@shopease.com',   password: 'test1234',  role: 'buyer', isVerified: true });

  console.log('\n👤 Demo accounts created:');
  console.log('   Seller → seller@shopease.com / seller123');
  console.log('   Buyer  → buyer@shopease.com  / buyer123');
  console.log('   Test   → test@shopease.com   / test1234');

  const products = buildProducts(seller._id);
  let created = 0;
  for (const p of products) {
    await Product.create({
      ...p,
      seller: seller._id,
      reviews: [],
    });
    created++;
    process.stdout.write(`\r🛍️  Creating products... ${created}/${products.length}`);
  }

  console.log(`\n\n✅ ${created} products seeded successfully!`);
  console.log('\n🚀 Run the app:');
  console.log('   Backend : npm run dev   (from backend/)');
  console.log('   Frontend: npm start     (from frontend/)');
  console.log('\n📱 Open: http://localhost:3000\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});

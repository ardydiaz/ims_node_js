const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Renamed to `Product`
const multer = require('multer');

// Image upload configuration
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Optional: set a file size limit
}).single('product_image');


// Route for Insert product
router.post("/add", upload, async (req, res) => {
    if (!req.file) {
        console.log("No file uploaded.");
        req.session.message = {
            type: 'danger',
            message: "File upload failed.",
        };
        return res.redirect('/add');
    }
    try {
        const newProduct = new Product({
            product_code: req.body.product_code,
            product_name: req.body.product_name,
            product_description: req.body.product_description,
            product_image: req.file.filename,
        });
        await newProduct.save();
        req.session.message = {
            type: 'success',
            message: "Product added successfully",
        };
        res.redirect('/');

    } catch (error) {
        console.error("Error while saving product:", error);
        res.json({ message: error.message, type: 'danger' });
    }


});

// Home route
router.get('/', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from the database
        const message = req.session.message;// Pass the session message if it exists
        console.log("Message in session:", message); // Debugging
        req.session.message = null;// Clear the message after sending it to the view
    
        res.render('index', { 
            title: "HomePage",
            products: products,
            message: message, 
           
        });

    }catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
   
});

// route Add product page
router.get('/add', (req, res) => {
    res.render('add_products', { title: 'Add Products' });
});

//route update product
router.get('/edit/:id', async (req, res) => {
    try {
        const productId = req.params.id
        // Fetch the product by its ID
        const product = await Product.findById(productId);
        if (!product) {
            // If no product is found, handle the error
            req.session.message = {
                type: 'danger',
                message: 'Product not found!',
            };
            return res.redirect('/');
        }

        // Render the edit form with the product data
        res.render('edit', { 
            title: 'Edit Product', 
            product: product 
        });
    }catch (error) {
        console.error("Error fetching products:", error);
        req.session.message = {
            type: 'danger',
            message: 'An error occurred while fetching the product.',
        };
        res.redirect('/');
    }
});

//route submit update data
router.post('/update/:id', upload, async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedData = {
            product_code: req.body.product_code,
            product_name: req.body.product_name,
            product_description: req.body.product_description,
        };

        // Check if a new image is uploaded
        if (req.file) {
            updatedData.product_image = req.file.filename;
        }

        await Product.findByIdAndUpdate(productId, updatedData);

        req.session.message = {
            type: 'success',
            message: 'Product updated successfully!',
        };
        
        res.redirect('/');
    } catch (error) {
        console.error("Error updating product:", error);
        req.session.message = {
            type: 'danger',
            message: 'An error occurred while updating the product.',
        };
        res.redirect(`/edit/${req.params.id}`);
    }
});

// Delete Product
router.get('/delete/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Find and delete the product by ID
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            req.session.message = {
                type: 'danger',
                message: 'Product not found!',
            };
            return res.redirect('/');
        }

        // Optionally, delete the associated image file from the filesystem
        const fs = require('fs');
        const imagePath = `./uploads/${product.product_image}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the image
        }

        req.session.message = {
            type: 'success',
            message: 'Product deleted successfully!',
        };

        res.redirect('/');
    } catch (error) {
        console.error('Error deleting product:', error);
        req.session.message = {
            type: 'danger',
            message: 'An error occurred while deleting the product.',
        };
        res.redirect('/');
    }
});

module.exports = router;

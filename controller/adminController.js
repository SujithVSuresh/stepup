const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModal");
const Varient = require("../models/varientModel");
const Subvarient = require("../models/subVarientModel");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("admin/login", { isLogin: false });
    }

    if (req.method == "POST") {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email });
      //console.log(admin.password);

      if (admin && (await bcrypt.compare(password, admin.password))) {
        req.session.adminId = admin._id;
        req.session.adminName = admin.firstName + " " + admin.lastName;
        res.status(200).json({ message: "login successfull" });
      } else {
        res
          .status(404)
          .json({ message: "No user found with these email and password" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    if (req.session.adminId) {
      delete req.session.adminId;
      delete req.session.adminName;
    }

    res.redirect("/admin");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const dashboard = async (req, res) => {
  try {
    res.render("admin/dashboard", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const products = async (req, res) => {
  try {
    res.render("admin/product", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: false }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      console.log(products);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProducts = async (req, res) => {
  try {
    res.render("admin/unlistedProduct", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProductData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: true }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.method == "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
      } = req.body;

      console.log(
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description
      );

      // const imagePaths = req.files.map((file) => file.filename);

      const newProduct = new Product({
        modelName: model,
        brand: brand,
        gender: gender,
        category: category,
        outerMaterial: outerMaterial,
        soleMaterial: soleMaterial,
        description: description,
      });

      await newProduct.save();

      return res.status(200).json({ msg: "Product created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.method === "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
        id,
      } = req.body;

      let product = await Product.findOne({ _id: id });

      // let checkingCategory = await Category.findOne({
      //   categoryName: categoryName,
      //   _id: { $ne: id },
      // });

      // if (!checkingCategory) {
      //   category.categoryName = categoryName;
      //   await category.save();
      //   res.status(200).json({ categoryData: category });
      // } else {
      //   res.status(409).json({ message: "Category already exists" });
      // }

      console.log("Hello...............", product);

      product.modelName = model;
      product.brand = brand;
      product.gender = gender;
      product.category = category;
      product.outerMaterial = outerMaterial;
      product.soleMaterial = soleMaterial;
      product.description = description;

      product.save();

      // res.redirect('/admin/products')

      return res.status(200).json({ message: "product edited successfully."});

    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageProductDeleteStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      let product = await Product.findOne({ _id: id });

      product.isDelete = !product.isDelete;

      await product.save();

      res.status(200).json({ deleteStatus: product.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users
const users = async (req, res) => {
  try {
    res.render("admin/user", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const usersData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const users = await User.find({});

      res.status(200).json({ users: users });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { userId } = req.body;

      const user = await User.findOne({ _id: userId });

      if (user.isBlocked === true) {
        user.isBlocked = false;
        await user.save();
      } else {
        user.isBlocked = true;
        await user.save();
      }

      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//BRAND
const brands = async (req, res) => {
  try {
    //let categories = await Category.find({isDelete: false});

    //console.log(category);
    res.render("admin/brand", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addBrand = async (req, res) => {
  try {
    if (req.method === "POST") {
      try {
        const { brandValue } = req.body;

        console.log("lll", req.file.filename, brandValue);

        let brand = await Brand.findOne({ name: brandValue });
        // console.log(category, "lllll")

        if (!brand) {
          const newBrand = new Brand({
            name: brandValue,
            image: req.file.filename,
          });
          await newBrand.save();
          res.status(200).json({ brandData: newBrand });
        } else {
          res
            .status(409)
            .json({ message: "Brand with this name already exist." });
        }
      } catch (error) {
        console.error("Error in addColorVarient:", error);
        res.status(500).json({ error: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const brandList = async (req, res) => {
  try {
    let brands = await Brand.find({});

    res.status(200).json({ brands: brands });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const category = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    console.log(category);
    res.render("admin/category", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const categoryList = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    res.status(200).json({ categories: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedCategory = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: true });

    res.render("admin/unlistedCategory", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryValue } = req.body;

      let category = await Category.findOne({ categoryName: categoryValue });

      if (!category) {
        const newCategory = new Category({
          categoryName: categoryValue,
          image: req.file.filename,
        });
        await newCategory.save();
        res.status(200).json({ categoryData: newCategory });
      } else {
        res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryName, id } = req.body;

      let category = await Category.findOne({ _id: id });

      let checkingCategory = await Category.findOne({
        categoryName: categoryName,
        _id: { $ne: id },
      });

      if (!checkingCategory) {
        category.categoryName = categoryName;
        await category.save();
        res.status(200).json({ categoryData: category });
      } else {

        res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageCategoryStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      console.log(id);

      let category = await Category.findOne({ _id: id });

      category.isDelete = !category.isDelete;

      await category.save();

      res.status(200).json({ deleteStatus: category.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addColorVarient = async (req, res) => {
  try {
    const { colorName, colorCode, productId } = req.body;

    let findColorVarient = await Varient.findOne({colorName: colorName, colorCode: colorCode})

    if(findColorVarient){
      return res.status(409).json({ "message": "Color you are trying to add already exists." });
    }

    const files = req.files;

    const productImage = await Object.values(files).map(
      (item) => item[0].filename
    );

    const colorVarient = new Varient({
      colorName: colorName,
      colorCode: colorCode,
      images: productImage,
      product: productId,
    });

    await colorVarient.save();

    if(colorVarient){
      return res.status(200).json({ "message": "Color added successfully" });

    }

    
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteColorVarient = async (req, res) => {
  try {
    const { varientId } = req.body;

    console.log(varientId, "colorVarientId");


    const colorVariant = await Varient.findOne({ _id: varientId});

     if (!colorVariant) {
      return res.status(409).json({ message: "No color varient found" });
     }

    await Varient.findByIdAndDelete(colorVariant._id);

    return res.status(200).json({ message: "Color variant deleted successfully." });
    
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSizeVarient = async (req, res) => {
  try {
    const { price, size, quantity, productId, varientId } = req.body;

    let checkingSubVarient = await Subvarient.findOne({size: size, varient: varientId})

    console.log(checkingSubVarient, "preeeee");

    if(checkingSubVarient){
      return res.status(409).json({ message: "Size with this value already exists." });
    }

    const subVarient = new Subvarient({
      size: size,
      quantity: quantity,
      price: price,
      varient: varientId,
      product: productId,
    });

 

    await subVarient.save();

    return res.status(200).json({ subVarient: subVarient });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};


const editSizeVarient = async (req, res) => {
  try {
   
    const { price, size, quantity, id, varientId } = req.body;

    let checkingSubVarient = await Subvarient.findOne({size: size, varient: varientId, _id:{$ne: id}})

    if(!checkingSubVarient){
      let subVarient = await Subvarient.findOne({_id: id})

      subVarient.price = price
      subVarient.size = size
      subVarient.quantity = quantity
  
      await subVarient.save();
  
      return res.status(200).json({ subVarient: subVarient });
      
    }else{
      return res.status(409).json({ message: "Size with this value already exists." });

    }



  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteSizeVarient = async (req, res) => {
  try {
   
    const { id } = req.body;

    const subVarient = await Subvarient.findByIdAndDelete(id);
    if (subVarient) {
      return res.status(200).json({ message: "Size deleted successfully",  subVarient: subVarient });
    } else {
      return res.status(404).json({ error: "Size not found" });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllColorVarient = async (req, res) => {
  try {
    const productId = req.query.pid;

    const varients = await Varient.find({ product: productId });

    res.status(200).json({ colorVarients: varients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSizeVarient = async (req, res) => {
  try {
    const varientId = req.query.varientid;

    console.log(varientId, "Hi, how are you");

    const subVarients = await Subvarient.find({ varient: varientId });

    console.log(subVarients, "Hi, how are you222");

    res.status(200).json({ sizeVarients: subVarients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const singleProductData = async (req, res) => {
  try {
    const productId = req.query.pid;

    const productData = await Product.findOne({ _id: productId }).populate([
      { path: "category" },
      { path: "brand" },
    ]);

    res.status(200).json({ productData: productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  dashboard,
  products,
  unlistedProducts,
  addProduct,
  editProduct,
  manageProductDeleteStatus,
  unlistedProductData,
  users,
  login,
  logout,
  category,
  addCategory,
  unlistedCategory,
  usersData,
  userStatus,
  productData,
  manageCategoryStatus,
  editCategory,
  categoryList,
  brands,
  addBrand,
  brandList,
  addColorVarient,
  deleteColorVarient,
  addSizeVarient,
  editSizeVarient,
  deleteSizeVarient,

  getAllColorVarient,
  getAllSizeVarient,
  singleProductData,
};

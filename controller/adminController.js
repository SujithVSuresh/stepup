const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModal");
const Varient = require("../models/varientModel");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  if (req.method == "GET") {
    res.render("admin/login", {isLogin: false});
  }

  if (req.method == "POST") {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email });
    //console.log(admin.password);

    if (admin && (await bcrypt.compare(password, admin.password))) {
      req.session.adminId = admin._id;
      req.session.adminName = admin.firstName + " " + admin.lastName
      res.status(200).json({ message: "login successfull" });
    } else {
      res
        .status(404)
        .json({ message: "No user found with these email and password" });
    }
  }
};


const logout = (req, res) => {
  if (req.session.adminId) {
    delete req.session.adminId;
    delete req.session.adminName;
  }

  res.redirect("/admin");
};

const dashboard = async (req, res) => {
  res.render("admin/dashboard", {isLogin: true, adminName:req.session.adminName});
};

const products = async (req, res) => {
  res.render("admin/product", {isLogin: true, adminName:req.session.adminName});
};

const productData = async (req, res) => {
  if (req.method === "GET") {
    const products = await Product.find({}).populate([
      { path: 'category' },
      { path: 'brand' }
  ]);

    res.status(200).json({ products: products });
  }
};

const addProduct = async (req, res) => {
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

    console.log("product created");
    res.status(200).json({ msg: "Product created successfully" });
  }
};

// Users
const users = async (req, res) => {
  res.render("admin/user", {isLogin: true, adminName:req.session.adminName});
};

const usersData = async (req, res) => {
  if (req.method === "GET") {
    const users = await User.find({});

    res.status(200).json({ users: users });
  }
};

const userStatus = async (req, res) => {
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
};


//BRAND
const brands = async (req, res) => {
  //let categories = await Category.find({isDelete: false});

  //console.log(category);
  res.render("admin/brand", { isLogin: true, adminName:req.session.adminName});
};

const addBrand = async (req, res) => {
  if (req.method === "POST") {
   
    const { brandValue } = req.body;

    console.log("lll", req.file.filename, brandValue)
    
     let brand = await Brand.findOne({ name: brandValue});
    // console.log(category, "lllll")

     if(!brand){
    const newBrand = new Brand({ name: brandValue, image: req.file.filename });
    await newBrand.save();
    res.status(200).json({ brandData: newBrand });
     }else{
       res.status(409).json({ message: "Brand with this name already exist." })
     }

    
  }
};


const brandList = async (req, res) => {
  let brands = await Brand.find({});

  res.status(200).json({brands: brands})
};


const category = async (req, res) => {
  let categories = await Category.find({isDelete: false});

  console.log(category);
  res.render("admin/category", { categories: categories, isLogin: true, adminName:req.session.adminName});
};



const categoryList = async (req, res) => {
  let categories = await Category.find({isDelete:false});

  res.status(200).json({categories: categories})
};


const unlistedCategory = async (req, res) => {
  let categories = await Category.find({isDelete: true});

  res.render("admin/unlistedCategory", { categories: categories, isLogin: true , adminName:req.session.adminName});
};

const addCategory = async (req, res) => {
  if (req.method === "POST") {
   
    const { categoryValue } = req.body;
    
     let category = await Category.findOne({ categoryName: categoryValue});

     if(!category){
    const newCategory = new Category({ categoryName: categoryValue, image: req.file.filename });
    await newCategory.save();
    res.status(200).json({ categoryData: newCategory });
     }else{
       res.status(409).json({ message: "Category already exists" })
     }

    
  }
};

const editCategory = async (req, res) => {
  if (req.method === "POST") {
    const { categoryName, id } = req.body;

    let category = await Category.findOne({ _id: id });



    let checkingCategory =  await Category.findOne({categoryName: categoryName, _id:{$ne: id }})

    if(!checkingCategory){
    category.categoryName = categoryName
    await category.save()
    res.status(200).json({ categoryData: category });
  }else{
    res.status(409).json({ message: "Category already exists" })
  }
  }
};

const manageCategoryStatus = async (req, res) => {
  if (req.method === "POST") {
    const { id } = req.body;

    console.log(id);

    let category = await Category.findOne({ _id: id });

    category.isDelete = !category.isDelete;

    await category.save();


    res.status(200).json({deleteStatus: category.isDelete});
  }
};


const addColorVarient = async (req, res) => {
  try {
  
    const {colorName, colorCode} = req.body

    const files = req.files;

    console.log(files); 
    console.log(req.body);

    const productImage = Object.values(files).map(item => item[0].filename);

    const colorVarient = Varient({
      colorName: colorName,
      colorCode: colorCode,
      images: productImage,
      product: '664c4997ddbf4dee03ca30cf'

    })

    await colorVarient.save()

  
  } catch (error) {

    console.error('Error in addColorVarient:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  dashboard,
  products,
  addProduct,
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
  addColorVarient
};

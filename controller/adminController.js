const Category = require('../models/categoryModel')
const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')


const login = async (req, res) => {
  if(req.method == "GET"){
  res.render('admin/login')
  }
  
  if(req.method == "POST"){
    const { email, password } = req.body;
    console.log(email, password);

    const admin = await Admin.findOne({email: email});
    console.log(admin, "jioi")
  

    if(admin && (await bcrypt.compare(password, admin.password))){
        req.session.adminId = admin._id;
        res.status(200).json({ message: "login successfull" });
    }else{
        res.status(400).json({ message: "No user found with these email and password" });
    }

}
}


const dashboard = async (req, res) => {
    res.render('admin/dashboard')  
}

const products = async (req, res) => {
    res.render('admin/product')
}


const productData = async (req, res) => {
  if (req.method === "GET") {
      
    const products = await Product.find({}).populate('category');
    
    console.log("jjj", products)
    res.status(200).json({products: products})
  }

}

const addProduct = async (req, res) => {
  if(req.method == "GET"){
  res.render('admin/addProducts')
  }

  if(req.method == "POST"){
    const {
      model,
      brand,
      quantity,
      size,
      color,
      gender,
      price,
      category,
      occasion,
      outerMaterial,
      soleMaterial,
      description,
      
  } = req.body;

  console.log(
    model,
    brand,
    quantity,
    size,
    color,
    gender,
    price,
    category,
    occasion,
    outerMaterial,
    soleMaterial,
    description,  
)

console.log("uuiu", req.files)
const imagePaths = req.files.map(file => file.filename);

  const newProduct = new Product({
    modelName: model,
    brand:brand,
    quantity:quantity,
    size:[8, 9, 10],
    color:color,
    gender:gender,
    price:price,
    category:"663cca5cbaf284c0c2b7f5f5",
    occasion:occasion,
    outerMaterial:outerMaterial,
    soleMaterial:soleMaterial,
    description:description,
    images: imagePaths
})

await newProduct.save()

console.log("product created")
res.status(200).json({"msg": "Product created successfully"})

  }
}

// Users
const users = async (req, res) => {
    res.render('admin/user')
  }

const usersData = async (req,res) => {
    if (req.method === "GET") {
      
      const users = await User.find({})
  
      res.status(200).json({users: users})
    }
  } 

const userStatus = async (req, res) => {
  if(req.method === "POST"){
    const {userId} = req.body

    const user = await User.findOne({_id: userId})

    if(user.isBlocked===true){

      user.isBlocked = false;
      await user.save();

    }else{

      user.isBlocked = true;
      await user.save();

    }

    res.status(200).json(user)
  
  }
}  



const category = async (req,res) =>{

  let categories = await Category.find({})

  console.log(category)
    res.render('admin/category', {categories: categories})
}  


const addCategory = async (req,res) => {
  if (req.method === "POST") {


    const { categoryValue } = req.body;

    const newCategory = new Category({categoryName: categoryValue})
    await newCategory.save()
    console.log("CATEGORY SAVED")

    res.status(200).json({categoryData: newCategory})
  }
}   

  


module.exports = {
    dashboard,
    products,
    addProduct,
    users,
    login,
    category,
    addCategory,
    usersData,
    userStatus,
    productData
}
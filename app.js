const express=require("express")
const bodyParser=require("body-parser")
const request=require("request");
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);




const app=express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

mongoose.connect("mongodb+srv://Shivamsarmaroy:Shivam%40123@cluster0.uikcklb.mongodb.net/todolistDB");

const itemSchema=new mongoose.Schema({
    name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
   name:"Welcome in your to do list!!"
});

const defaultItems=[item1];

const listSchema=new mongoose.Schema({
    name:String,
    item:[itemSchema]
});

const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){
   Item.find({},function(err,items){
    if(err){
        console.log(err);
    }
    else{
        if(items.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Sucessefully Saved the entries!");
                }
            })
            res.redirect("/");
        }
        
        else{
            res.render("list",{titleName:"Today",newitems:items});
        }
        
    }
   })
               
});





app.post("/",function(req,res){

const itemName=req.body.newitem;
const listName=req.body.btnlist;
const newItem=new Item({
    name:itemName,
    })
  if(listName=="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
        foundList.item.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
    })

  }

    
})

app.post("/delete",function(req,res){
    const checkboxItem=req.body.checkbox;
    const tname=req.body.listName;
    if(tname=="Today"){
        Item.findByIdAndRemove(checkboxItem,function(err){
            if(!err){
                console.log("Sucessfully deleted items");
                res.redirect("/");
            }
        })

    }
    else{
        List.findOneAndUpdate({name:tname},{$pull: {item:{_id: checkboxItem}}},function(err,foundList){
            if(!err){
                res.redirect("/"+tname);
            }
        })
    }
   
})





app.get("/:id",function(req,res){
  const nameP=req.params.id;
  List.findOne({name:nameP},function(err,foundList){
    if(!err){
        if(!foundList){
            const list=new List({
                name:nameP,
                item:defaultItems
              })
              list.save();
           res.redirect(`/${nameP}`);    
        }
        else{
            res.render("list",{titleName:nameP,newitems:foundList.item});
        }
    }
  });
 
})


app.get("/about",function(req,res){
res.render("about");
})







app.listen(process.env.PORT || 3000,function(){
    console.log("server is running 3000");
})

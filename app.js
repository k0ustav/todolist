

//First run mongod and mongosh in terminal


const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const date =require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();
const day = date.getDate();
// const items =["Buy food","cook","eat"];
const workItem=[];

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//mongoose

mongoose.connect(process.env.MONGO_URI);

const itemSchema={
    name: String
};

const Item = mongoose.model("Item",itemSchema)

const item1 = new Item ({
    name: "Welcome to todolist"
})
const item2 = new Item ({
    name: "Hit + to add new item"
})
const item3 = new Item ({
    name: "< Hit this to delete an item"
})

const defaultItems = [item1,item2,item3];


const listSchema ={
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List",listSchema);


// mongoose.set('useFindAndModify', false);
//  mongoose.connect(uri, { useFindAndModify: false });
//mongoose

app.get("/",function(req,res){
    
    Item.find({})
        .then(function(foundItems){
        if (foundItems.length===0){
            Item.insertMany(defaultItems)
                .then(function(){
                    console.log("successfully saved");
                })
                .catch(function(err){
                    console.log(err);
                });
                res.redirect("/")
        }else {

            res.render("list",{listTitle: day,newListItems: foundItems});

        }
    });
    


});


app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

List.findOne({name: customListName})
    .then(function(foundList){
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();
            res.redirect("/"+customListName);
        }else{
            res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items,
              });
        }
    
    })
    .catch(function (err) {
        console.log(err);
      });


});

app.post("/",function(req,res){

    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName===day){
        item.save();
        res.redirect("/");
    }else {
        List.findOne({name:listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }


    // if ( req.body.list === "Work List"){
    //     workItem.push(item);
    //     res.redirect("/work");
    // }else {
    //     items.push(item);
    //     res.redirect("/");
    // }
   
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;

    if(listName===day){
        
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            console.log("successfully deleted");
        })
        res.redirect("/")
    }else {

        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
        .then(function(findList){
            res.redirect("/"+listName);
        })
    }

})

app.get("/work",function(req,res){
    res.render("list",{listTitle: "Work List",newListItems: workItem});
})
app.post("/work",function(req,res){
    let item=req.body.newItem;
    res.redirect("/work")

})

app.get("/about",function(req,res){
    res.render("about");
})
app.listen(process.env.PORT || 3000, function () {
	console.log("Server started on port 3000");
});
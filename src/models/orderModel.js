const mongoose=require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId

const orderSchema=new mongoose.Schema(
    {
        userId: {type: ObjectId, ref:"User"},
        items: [{
          productId: {type:ObjectId, ref:'Product'},
          quantity: {type:Number}
        }],
        totalPrice: {type:Number},
        totalItems: {type:Number},
        totalQuantity: {type:Number},
        cancellable: {type:Boolean, default: true},
        status: {type:String, default: 'pending'},// enum[pending, completed, cancled]},
        deletedAt: {type:Date}, // when the document is deleted}, 
        isDeleted: {type:Boolean, default: false}
      },{timeStamps:true})

module.exports=mongoose.model("Order",orderSchema)

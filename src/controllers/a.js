 let items= [{
    productId:"88abc190ef0288abc190ef55",
    quantity: 2
  }, {
    productId:"88abc190ef0288abc190ef60",
    quantity: 5
  }]
  let sum=0
  for(let i of items){
    sum+=i.quantity
  }
  console.log(sum)
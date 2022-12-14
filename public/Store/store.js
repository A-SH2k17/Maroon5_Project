//to chaeck if the page is loaded
if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded',ready)
}else{
    ready()
}

function ready(){
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for(var i=0;i< removeCartItemButtons.length;i++){
        var button = removeCartItemButtons[i]
        button.addEventListener('click',removeCartItem)
    } 
    
    
    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for(var i= 0;i<quantityInputs.length;i++){
        var input = quantityInputs[i]
        input.addEventListener('change',quantityChanged)
    }

    var addtoCartButtons = document.getElementsByClassName('shop-item-btn')
    for(var i=0;i<addtoCartButtons.length;i++){
        var button = addtoCartButtons[i]
        button.addEventListener('click',addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click',purchaseClicked)
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'en',
    token: function(token){
        var items =[]
        var cartItemsContainer = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemsContainer.getElementsByClassName('cart-row')
        for(var i=0;i<cartRows.length;i++){
            var cartRow = cartRows[i]
            var quantiyElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
            var quantity = quantiyElement.value
            var id = cartRow.dataset.itemId
            console.log(id)
            items.push({
                id: id,
                quantity: quantity
            })
        }
        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res){
            return res.json()
        }).then(function(data){
            alert(data.message)
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while(cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch(function(error){
            console.log(error)
        })
    }
})

function purchaseClicked(){
    //alert('Thanks for your purchase')
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$','')) * 100
    stripeHandler.open({
        amount: price
    })
}

function addToCartClicked(event){
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imgsrc = shopItem.getElementsByClassName('shop-item-img')[0].src
    var id = shopItem.dataset.itemId
    console.log(id)
    addItemtoCart(title,price,imgsrc,id)
}

function addItemtoCart(title,price,imgsrc,id){
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for(var i=0;i<cartItemNames.length;i++){
        if(cartItemNames[i].innerText == title){
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowcontents =`
        <div class="cart-item cart-column">
            <img src="${imgsrc}" alt="cup" width="100" height="100" class="cart-item-img">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quant cart-column">
            <input type="number" name="quantity" id="quantity" value="1" class="cart-quantity-input"/>
            <button role="button" class="btn btn-danger">Remove</button>
        </div>
    `
    cartRow.innerHTML = cartRowcontents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click',removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change',quantityChanged)
    updateCartTotal()
}

function quantityChanged(event){
    var input = event.target
    if(isNaN(input.value) || input.value <=0){
        input.value = 1
    }
    updateCartTotal()
}
function removeCartItem(event){
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}


function updateCartTotal(){
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total =0
    for(i=0;i<cartRows.length;i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantiyElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$',''))
        var quantity = quantiyElement.value
        total = total + price * quantity
    }
    total = Math.round(total*100)/100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$'+total
}
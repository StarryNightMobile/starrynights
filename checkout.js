
let cart=[];

function addToCart(product, price){
  cart.push({name:product, price:price});
  startCheckout();
}

function startCheckout(){
  const panel=document.getElementById("checkoutPanel");
  const cartDiv=document.getElementById("cartItems");
  cartDiv.innerHTML="";

  cart.forEach(item=>{
    const div=document.createElement("div");
    div.className="checkout-item";
    div.innerHTML=`<span>${item.name}</span><span>$${item.price.toFixed(2)}</span>`;
    cartDiv.appendChild(div);
  });

  panel.classList.add("active");
  document.getElementById("paymentSection").style.display="block";
}

// PAY NOW BUTTON (70% DEPOSIT)
document.getElementById("payNowBtn").addEventListener("click", async()=>{
  const total=cart.reduce((sum,item)=>sum+item.price,0);
  const deposit=(total*0.7).toFixed(2);

  try{
    const res=await fetch("/.netlify/functions/paynow", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ amount:deposit, currency:"USD", items:cart })
    });

    const data=await res.json();
    if(data.success){
      document.getElementById("successMsg").innerText="Payment successful! Redirecting...";
      document.getElementById("successMsg").style.display="block";
      setTimeout(()=>{ window.location.href="thankyou.html"; },2000);
    }else{
      document.getElementById("errorMsg").style.display="block";
    }
  }catch(err){ document.getElementById("errorMsg").style.display="block"; }
});

// CASH ON DELIVERY
document.getElementById("cashBtn").addEventListener("click",()=>{
  document.getElementById("successMsg").innerText="Order placed for Cash on Delivery! Redirecting...";
  document.getElementById("successMsg").style.display="block";
  setTimeout(()=>{ window.location.href="thankyou.html"; },2000);
});

// CONNECT ALL BUY NOW BUTTONS
document.querySelectorAll(".card .btn-primary").forEach(btn=>{
  btn.addEventListener("click", e=>{
    const card=e.target.closest(".card");
    const name=card.querySelector("h4").innerText;
    const price=parseFloat(card.querySelector("p").innerText.replace('$',''));
    addToCart(name, price);
  });
});
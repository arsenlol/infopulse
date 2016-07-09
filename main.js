var arr = [], // BASKET MODEL
basket = document.querySelector('#basket'),
minBasket = document.querySelector('#min-basket'),
popup = document.querySelector('#popup-bg'),
buy = document.querySelector('#buy'),
success = document.querySelector('#success'),
remove = document.getElementsByClassName('remove'),
closePopup = document.getElementById('close'),
complete = document.getElementById('complete'),
select = document.querySelector('#sort'),
filter = document.querySelector('#search'),
item = document.getElementsByClassName('item');

// LOAD LAYOUT FROM BASKET MODEL
function buildBasket(){
	var html = '';
	for (var i = 0 ; i < arr.length; i++){
		 html += '<li>'+
					'<div class="pt"><span class="number">01.</span> <span class="b-name">' + arr[i].name + '</span></div>'+
					'<div class="pt b-quan">' + arr[i].quantity + '</div>'+
					'<div class="pt b-price">' + (arr[i].price*arr[i].quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +' $</div>'+
					'<div class="pt"><span class="remove">remove</span></div>'+
				'</li>'
	}
	while (basket.hasChildNodes()){basket.removeChild(basket.firstChild);}
	basket.innerHTML = html;
	handleRemoveEvent();
}

// SHOW BASKET POPUP
var openBasket = function(){
	popup.style.display = "block";
	buildBasket();
}

// ADD TO BASKET MODEL
function add(addName,addQuan,addPrice) {
	var itemExists = false;
	for (var i = 0 ; i < arr.length ; i++){
	    if(arr[i].name === addName){
	    	arr[i].quantity = addQuan;
	    	itemExists = true;
	    	break;
	    } 
	}
	if (!itemExists){
	var item = {name:addName, quantity:addQuan, price:addPrice};
	arr.push(item);
	}
}

// ADD NEW ITEM
function addToBasket(item){
	var quan = parseInt(item.parentNode.querySelector('.item-quan').innerText),
	i_name = item.parentNode.querySelector('.name').innerText,
	price = parseFloat(item.parentNode.querySelector('.price').innerText.replace(/ /g,''));
	add(i_name,quan,price);
	refreshSum();
}

// DEL FROM BASKET MODEL
function del(array, delName){
	for (var i = 0 ; i < array.length ; i++){
	    if(array[i].name === delName){
	    var deleted = array.splice(i,1);
	    }
	}
	//resetCookies();
	return array;
}

// REMOVE FROM BASKET FUNCTION
function handleRemoveEvent(){
	for (var i = 0; i < remove.length; i++){
		remove[i].addEventListener('click', function(){
			var name = this.parentNode.parentNode.querySelector('.b-name').innerText
			del(arr,name);
			buildBasket();
			refreshSum();
		});
	}
}

// REFRESH BASKET AMOUNT AND ITEM QUANTITY
function refreshSum(){
	var quantity = 0;
	var sum = 0;
	for (var i = 0; i < arr.length; i++){
		sum += (arr[i].price*arr[i].quantity);
		quantity += arr[i].quantity;
	}
	document.querySelector('.min-basket-quan').innerText = quantity;
	sum = parseFloat(sum.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' $';
	document.querySelector('.sum span').innerText = sum;
}

// GET CATALOG DATA
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            } else {
				setTimeout(function(){
					alert('XMLHttpRequest cannot load DATA.json to display catalog items. Please run the site by suppoted protocol schemes or visit https://arsenlol.github.io/infopulse/')
				},3000);
        	}
        } 
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

// BUILD CATALOG
function buildCatalog(array){
	var catalog = array,
	samples = [];
	if(filter.value.length>1){
		var searchExp = new RegExp (filter.value, 'i');
		for (var i = 0; i < catalog.length; i++){
			if(catalog[i].name.search(searchExp) != -1 || catalog[i].price.search(searchExp) != -1){
				 samples.push(catalog[i]);
			}
		}
	} else {
		samples = catalog;
	}

	if (select.value === 'name'){
		function mySort(a,b){ 
			if(a.name < b.name) return -1;
    		if(a.name > b.name) return 1;
    		return 0;}
	} else {
		function mySort(a,b){return a.price-b.price;}
	}
	samples.sort(mySort);

	var html = '';
	for (var i = 0; i < samples.length; i++){
		html += 
		'<div class="item">'+
			'<span class="name">' + samples[i].name + '</span>'+
			'<div class="icon"><img src="img/photo.jpg" alt="icon"></div>'+
			'<p>quantity<span class="item-quan">0</span><span class="more">&nbsp;</span><span class="less">&nbsp;</span></p>'+
			'<div class="price">' + samples[i].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' $</div><div class="add">buy</div>'+
		'</div>';
	}
	document.querySelector('.catalog').innerHTML = html;
	handleEvents();
}

// ONLOAD
fetchJSONFile('data.json', function(data){
	buildCatalog(data);
	filter.addEventListener('keyup',function(){
		buildCatalog(data);
	});
	select.addEventListener('change',function(){
		buildCatalog(data);
	});
	complete.addEventListener('click',function(){
		buildCatalog(data);
	});
});

// HANDLE EVENTS ON STATIC ELEMENTS
minBasket.addEventListener('click',openBasket);
buy.addEventListener('click',function(){
		success.style.display = "block";
		while (arr.length>0){arr.pop()}
		refreshSum();
	});
popup.addEventListener('click',function(event){
		if(event.target === popup || event.target === closePopup || event.target === complete)
		{popup.style.display = "none";
		success.style.display = "none";}
	});

// HANDLE EVENTS ON GENERATED ELEMENTS
function handleEvents(){
	for (var i = 0; i < item.length; i++){
		var addButton = item[i].querySelector('.add'),
		name = item[i].querySelector('.name'),
		plus = item[i].querySelector('.more'),
		minus = item[i].querySelector('.less');
		addButton.addEventListener('click', function(){
			if(parseInt(this.parentNode.querySelector('.item-quan').innerText) < 1){
				var warn = document.createElement('div'),
				parent = this.parentNode;
				warn.className = 'quan-warn';
				warn.innerText = 'Set the quantity of item plz';
				this.parentNode.appendChild(warn);
				setTimeout(function(){
					parent.removeChild(parent.lastChild)
				},3000);
			} else {
			addToBasket(this);
			openBasket();
			}
		});
		plus.addEventListener('click', function(){
			var quantity = this.parentNode.querySelector('.item-quan').innerText;
			this.parentNode.querySelector('.item-quan').innerText = parseInt(quantity)+1;
		});
		minus.addEventListener('click', function(){
			var quantity = this.parentNode.querySelector('.item-quan').innerText;
			this.parentNode.querySelector('.item-quan').innerText = parseInt(quantity)-1;
			if (parseInt(this.parentNode.querySelector('.item-quan').innerText)<1){
				this.parentNode.querySelector('.item-quan').innerText = '0'
			}
		});
	}
}
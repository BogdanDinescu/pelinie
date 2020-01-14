function appendContent(post){
	let figure = document.createElement("figure");
	figure.id = post._id;
	let figcaption = document.createElement("figcaption");
	figcaption.innerHTML = post.caption;
	let info = document.createElement("div");
	info.className = "info";
	let d = new Date(post.date);
	info.innerHTML = `${post.category} ${d.toLocaleDateString('en-GB')}`;
	let img = document.createElement("img");
	img.src = post.path;
	let puncte = document.createElement("div");
	puncte.innerHTML = post.votes;
	puncte.className = "puncte";
	let buttonup = document.createElement("button");
	buttonup.className = "up";
	buttonup.onclick = vote;
	if(user.likes.includes(post._id))
		buttonup.style.filter = "invert(100%)";
	let buttondown = document.createElement("button");
	buttondown.className = "down";
	buttondown.onclick = vote;
	if(user.dislikes.includes(post._id))
		buttondown.style.filter = "invert(100%)";
	let buttoncommnent = document.createElement("button");
	buttoncommnent.className = "comment";
	buttoncommnent.onclick = comments;
	let buttonshare = document.createElement("button");
	buttonshare.className = "share";
	buttonshare.onclick = share;
	figure.appendChild(figcaption);
	figure.appendChild(info);
	figure.appendChild(img);
	figure.appendChild(puncte);
	figure.appendChild(buttonup);
	figure.appendChild(buttondown);
	figure.appendChild(buttoncommnent);
	figure.appendChild(buttonshare);
	if(user.admin){
		let buttondelete = document.createElement("button");
		buttondelete.className = "delete";
		buttondelete.onclick = deletePost;
		figure.appendChild(buttondelete);
	}
	figure.appendChild(document.createElement("hr"));
	main.appendChild(figure);
}

window.onload = function(){
	user = JSON.parse(localStorage.getItem('user'));
	main = document.getElementsByTagName("main")[0];
	Skip = 0; // cate au fost incarcate deja
	Option = ""; // Optiunea, categoria
	Animat = 0;
	get_posts();
	get_categories();
	//setInterval(logoAnim,10000);
	if(user.admin){
		let aside = document.getElementsByTagName("aside")[0];
		let inputCategorie = document.createElement("input");
		inputCategorie.className = "inputSmall";
		inputCategorie.placeholder = "Noua categorie";
		let buttonCategorie = document.createElement("button");
		buttonCategorie.innerHTML = "Adauga categorie";
		buttonCategorie.onclick = addCategory;
		aside.appendChild(inputCategorie);
		aside.appendChild(buttonCategorie);
	}
}

function vote(){
	var xhttp = new XMLHttpRequest();
	var id = this.parentElement.id;
	var v;
	if(this.className == "up")
		v = 1;
	else
		v = 0;
	xhttp.open("GET", `/vote?id=${id}&vote=${v}`, true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			updateUI(id,this.responseText);
		}
	}
}

function comments(){
	var id = this.parentElement.id;
	window.open(`/comments?post=${id}`);
}

function updateUI(id,result){
	var figure = document.getElementById(id);
	var like = figure.querySelector(".up");
	var dislike = figure.querySelector(".down");
	var puncte = figure.querySelector(".puncte");
	switch(result){
		case "l":
			like.style.filter = "invert(100%)";
			puncte.innerHTML = Number(puncte.innerHTML) + 1;
			user.likes.push(id);
			break;
		case "d":
			dislike.style.filter = "invert(100%)";
			puncte.innerHTML = Number(puncte.innerHTML) - 1;
			user.dislikes.push(id);
			break;
		case "ul":
			like.style.filter = "invert(0%)";
			dislike.style.filter = "invert(0%)";
			puncte.innerHTML = Number(puncte.innerHTML) - 1;
			let l = user.likes.findIndex(function(i){
					return i == id;
			});
			user.likes.splice(l,1);
			break;
		case "ud":
			like.style.filter = "invert(0%)";
			dislike.style.filter = "invert(0%)";
			puncte.innerHTML = Number(puncte.innerHTML) + 1;
			let d = user.dislikes.findIndex(function(i){
					return i == id;
			});
			user.dislikes.splice(d,1);
			break;
	}
	localStorage.setItem('user',JSON.stringify(user));
}

function get_posts(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", `/get_posts?option=${Option}&skip=${Skip}`,true);
	Skip += 10;
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var posts = JSON.parse(this.responseText);
			posts.forEach(appendContent);
		}
	}
}

function listenerFunction(event){
	if(event.target.tagName == "LI"){
		main.innerHTML = "";
		Skip = 0;
		Option = event.target.innerText;
		get_posts();
	}
}

document.getElementById("categorii").addEventListener("click",listenerFunction);
document.getElementsByClassName("dropdown-content")[0].addEventListener("click",listenerFunction);

function get_categories(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/get_categories", true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var categories = JSON.parse(this.responseText);
			var selectOption = document.getElementById("category");
			var categorii = document.getElementById("categorii");
			for(var i=0;i<categories.length;i++){
				var opt = document.createElement("option");
				var li = document.createElement("li");
				opt.value = categories[i];
				opt.innerHTML = categories[i];
				li.innerHTML = categories[i];
				selectOption.appendChild(opt);
				categorii.appendChild(li);
			}
		}
	}
}

function addCategory(){
	var category = this.previousSibling.value;
	this.previousSibling.value = "";
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST","/add_category",true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(`category=${category}`);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			alert(this.responseText);
		}
	}
}

function upload(){
	var formData = new FormData();
	formData.append("caption", document.getElementById("caption").value);
	formData.append("category", document.getElementById("category").value);
	formData.append("photo", document.getElementById("photo").files[0]);
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST","/upload",true);
	xhttp.send(formData);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			Response(this.responseText);
		}
	}
}

function deletePost(){
	var xhttp = new XMLHttpRequest();
	var id = this.parentElement.id;
	xhttp.open("DELETE", `/delete_post?post=${id}`, true);
	xhttp.send();
	this.parentNode.parentNode.removeChild(this.parentNode);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			alert(this.responseText);
		}
	}
}

function logoAnim(){
	var logo = document.getElementById("logo");
	var n = 0;
	var id = setInterval(function(){
		if(n == 360){
			clearInterval(id);
			logo.style.transform = "";
		}else{
			logo.style.transform = `rotateX(${n}deg)`;
			n++;
		}
	},1);
}

window.addEventListener("dblclick",function(ev){
	if(ev.target.tagName == "IMG" && ev.target.parentElement.tagName == "FIGURE"){
		var cln = ev.target.cloneNode(false);
		cln.style.position = "fixed";
		cln.style.width = ev.target.width + "px";
		cln.style.height = ev.target.height + "px";
		cln.style.top = (ev.clientY - ev.target.height*0.5) + "px";
		cln.style.left = (ev.clientX - ev.target.width*0.5) + "px";
		document.body.appendChild(cln);
		// se micsoreaza
		var n = 1;
		var id = setInterval(function(){
			if(n < 0.6){
				clearInterval(id);
			}else{
				n = n - 0.1;
				cln.style.transform = `scale(${n})`;
			}
		},20);
		// se indreapta catre bara
		var contbuton = document.getElementsByTagName("header")[0].firstElementChild;
		console.log(contbuton);
		var p = (ev.clientY - ev.target.height*0.5)
		var id2 = setInterval(function(){
			if(p + ev.target.height < 0){
				clearInterval(id2);
				cln.remove();
				n = 1;
				// butonul cont pulseaza
				var id3 = setInterval(function(){
					if(n > 1.2){
						clearInterval(id3);
						var id4 = setInterval(function(){
							if(n < 1){
								clearInterval(id4);
							}else{
								n = n - 0.1;
								contbuton.style.transform = `scale(${n})`;
							}
						},40);
					}else{
						n = n + 0.1;
						contbuton.style.transform = `scale(${n})`;
					}
				},20);
			}else{
				cln.style.top = --p + "px";
			}
		},1);
		ev.target.parentElement.getElementsByClassName("up")[0].click();
	}
});

function share(){
	if(this.parentElement.lastChild.tagName == "INPUT")
		this.parentElement.removeChild(this.parentElement.lastChild);
	else{
		var id = this.parentElement.id;
		var link = document.createElement("input");
		this.parentElement.appendChild(link);
		link.value = `${window.location.href}comments?post=${id}`;
		link.select();
		link.setSelectionRange(0, 99999);
		document.execCommand("copy");
	}
}

function Response(text){
	var response = document.getElementById("response");
	response.innerHTML = text;
	var t = setTimeout(function (){ response.innerHTML = ""; }, 3000);
	response.addEventListener("click",function (){
		clearTimeout(t);
	});
}

function uploadgui(){
	document.getElementById("modal").style.display = "block";
}

function uploadclose(){
	document.getElementById("modal").style.display = "none";
}

function afisareCategorii(){
	var c = document.getElementById("categorii");
	if(c.style.maxHeight){
		c.style.maxHeight = null;
	}else{
		c.style.maxHeight = c.scrollHeight + "px";
	}
}
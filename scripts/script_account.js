window.onload = function(){
	main = document.getElementsByTagName("main")[0];
	aside = document.getElementsByTagName("aside")[0];

	var backButton = document.createElement("a");
	backButton.innerHTML = "Inapoi";
	backButton.onclick = function(){
		window.history.back();
	}
	var dropdown = document.getElementsByClassName("dropdown")[0];
	dropdown.parentElement.replaceChild(backButton, dropdown);
	

	document.querySelector("img.avatar").src = user.avatar ? user.avatar : "avatar.jpg";
	// numele utilizatorului
	var name = document.createElement("h2");
	var nameText = document.createTextNode(user.name);
	name.appendChild(nameText);
	aside.insertBefore(name,aside.firstChild.nextElementSibling.nextElementSibling);
	
	for(let post of paths){
			let figure = document.createElement("figure");
			let figcaption = document.createElement("figcaption");
			figcaption.innerHTML = post.caption;
			let img = document.createElement("img");
			img.src = post.path;
			figure.appendChild(figcaption);
			figure.appendChild(img);
			main.appendChild(figure);
		}
	
	const urlParams = new URLSearchParams(window.location.search);
	if(!urlParams.get('id')){
		
		creeazaInputuri();
		// butonul de update
		var buttonUpdate = document.createElement("button");
		buttonUpdate.onclick = updateProfile;
		buttonUpdate.innerHTML = "Updateaza profilul";
		aside.appendChild(buttonUpdate);
		aside.appendChild(document.createElement("br"));
		//buton de stergere cont
		var buttonDelete = document.createElement("button");
		buttonDelete.classList.add("deleteAccount");
		buttonDelete.innerHTML = "Sterge Cont";
		buttonDelete.addEventListener("click",function(ev){
			var r = confirm("Stergerea contului este ireversibila. Continuati?");
			if (r == true){
				var xhttp = new XMLHttpRequest();
				xhttp.open("DELETE", `/delete_user`, true);
				xhttp.send();
				xhttp.onreadystatechange = function() {
					if(this.readyState == 4 && this.status == 200) {
						window.location.href = '/';
					}
				}
			}
		});
		aside.appendChild(buttonDelete);
	}else{
		afiseazaProfil();
	}
	
}

function creeazaInputuri(){
	var form = document.getElementsByTagName("form")[0];
	
	// input file
	var inputfile = document.createElement("input");
	inputfile.type = "file";
	inputfile.accept = "image/*";
	inputfile.id = "avatar";
	form.appendChild(inputfile);
	form.appendChild(document.createElement("br"));
	// radio
	form.appendChild(document.createTextNode("Sex"));
	form.appendChild(document.createElement("br"));
	var radioBarbat = document.createElement("input");
	var radioFemeie = document.createElement("input");
	radioBarbat.type = radioFemeie.type = "radio";
	radioBarbat.name = radioFemeie.name = "sex";
	radioBarbat.value = "M";
	if(user.profile && user.profile.sex == "M") radioBarbat.checked = true;
	form.appendChild(radioBarbat);
	form.appendChild(document.createTextNode("Masculin"));
	form.appendChild(document.createElement("br"));
	radioFemeie.value = "F";
	if(user.profile && user.profile.sex == "F") radioFemeie.checked = true;
	form.appendChild(radioFemeie);
	form.appendChild(document.createTextNode("Feminin"));
	form.appendChild(document.createElement("br"));
	form.appendChild(document.createElement("br"));
	
	// checkbox
	var checkPop = document.createElement("input");
	var checkRock = document.createElement("input");
	var checkElectronica = document.createElement("input");
	var checkHipHop = document.createElement("input");
	var checkClasica = document.createElement("input");
	checkPop.type = checkRock.type = checkClasica.type = checkElectronica.type = checkHipHop.type = "checkbox";
	checkPop.name = checkRock.name = checkClasica.name = checkElectronica.name = checkHipHop.name = "music";
	checkPop.value = "Pop";
	checkRock.value = "Rock";
	checkElectronica.value = "Electronica";
	checkHipHop.value = "Hip-hop";
	checkClasica.value = "Clasica";
	if(user.profile){
		if(user.profile.music){
			if(user.profile.music.includes("Pop")) checkPop.checked = true;
			if(user.profile.music.includes("Rock")) checkRock.checked = true;
			if(user.profile.music.includes("Electronica")) checkElectronica.checked = true;
			if(user.profile.music.includes("Hip-hop")) checkHipHop.checked = true;
			if(user.profile.music.includes("Clasica")) checkClasica.checked = true;
		}
	}
	form.appendChild(document.createTextNode("Genurile muzicale preferate"));
	form.appendChild(document.createElement("br"));
	form.appendChild(checkPop);
	form.appendChild(document.createTextNode("Pop"));
	form.appendChild(document.createElement("br"));
	form.appendChild(checkRock);
	form.appendChild(document.createTextNode("Rock"));
	form.appendChild(document.createElement("br"));
	form.appendChild(checkElectronica);
	form.appendChild(document.createTextNode("Electronica"));
	form.appendChild(document.createElement("br"));
	form.appendChild(checkHipHop);
	form.appendChild(document.createTextNode("Hip Hop"));
	form.appendChild(document.createElement("br"));
	form.appendChild(checkClasica);
	form.appendChild(document.createTextNode("Clasica"));
	form.appendChild(document.createElement("br"));
	
	//range
	var range = document.createElement("input");
	range.type = "range";
	range.min = 0;
	range.max = 6;
	form.appendChild(document.createTextNode("Culoarea preferata"));
	form.appendChild(document.createElement("br"));
	range.addEventListener("change",sliderColor);
	if(user.profile && user.profile.color){
		range.value = user.profile.color;
		let event = new Event('change');
		range.dispatchEvent(event);
	}
	form.appendChild(range);
	form.appendChild(document.createElement("br"));
	
	//select
	form.appendChild(document.createTextNode("Categoria preferata"));
	form.appendChild(document.createElement("br"));
	var select = document.createElement("select");
	get_categories(select);
	form.appendChild(select);
	form.appendChild(document.createElement("br"));
	
	// textarea
	var textarea = document.createElement("textarea");
	textarea.cols = "30";
	textarea.rows = "10";
	if(user.profile && user.profile.bio) textarea.innerHTML = user.profile.bio;
	form.appendChild(document.createTextNode("O descriere a ta"));
	form.appendChild(textarea);
}

function afiseazaProfil(){
	var form = document.getElementsByTagName("form")[0];
	if(user.profile){
		if(user.profile.color){
			aside = document.getElementsByTagName("aside")[0];
			switch(user.profile.color){
				case "0":
					aside.style.borderColor = "violet";
					break;
				case "1":
					aside.style.borderColor = "indigo";
					break;
				case "2":
					aside.style.borderColor = "blue";
					break;
				case "3":
					aside.style.borderColor = "green";
					break;
				case "4":
					aside.style.borderColor = "yellow";
					break;
				case "5":
					aside.style.borderColor = "orange";
					break;
				case "6":
					aside.style.borderColor = "red";
					break;
			}
		}
		if(user.profile.sex){
			form.appendChild(document.createTextNode("Sex: "));
			switch(user.profile.sex){
				case "M":
					form.appendChild(document.createTextNode("Masculin"));
					break;
				case "F":
					form.appendChild(document.createTextNode("Feminin"));
					break;
			}
			form.appendChild(document.createElement("br"));
		}
		if(user.profile.music && user.profile.music.length){
			form.appendChild(document.createTextNode("Genuri muzicale preferate: "));
			form.innerHTML += user.profile.music.toString();
			form.appendChild(document.createElement("br"));
		}
		if(user.profile.category){
			form.appendChild(document.createTextNode("Categoria preferata: " + user.profile.category));
			form.appendChild(document.createElement("br"));
		}
		if(user.profile.bio){
			var q = document.createElement("blockquote");
			var text = document.createTextNode(user.profile.bio);
			q.append(text);
			form.appendChild(q);
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

function get_categories(selectOption){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/get_categories", true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var categories = JSON.parse(this.responseText);
			var modal = document.getElementById("category");
			var opt = document.createElement("option");
			selectOption.appendChild(opt);
			for(var i=0;i<categories.length;i++){
				let opt = document.createElement("option");
				opt.value = categories[i];
				opt.innerHTML = categories[i];
				selectOption.appendChild(opt);
				let opt2 = opt.cloneNode(true)
				modal.appendChild(opt2);
			}
			if(user.profile && user.profile.category) selectOption.value = user.profile.category;
		}
	}
}

function sliderColor(){
	switch(this.value){
		case "0":
			this.style.backgroundColor = "violet";
			break;
		case "1":
			this.style.backgroundColor = "indigo";
			break;
		case "2":
			this.style.backgroundColor = "blue";
			break;
		case "3":
			this.style.backgroundColor = "green";
			break;
		case "4":
			this.style.backgroundColor = "yellow";
			break;
		case "5":
			this.style.backgroundColor = "orange";
			break;
		case "6":
			this.style.backgroundColor = "red";
			break;
	}
}

function updateProfile(){
	var formData = new FormData();
	var radios = document.getElementsByName("sex");
	var radio;
	for(let r of radios){
		if(r.checked)
			radio = r.value;
	}
	var musics = document.getElementsByName("music");
	var music = [];
	for(let m of musics){
		if(m.checked)
			music.push(`"${m.value}"`);
	}
	var color = document.querySelector('input[type="range"]').value;
	var category = document.getElementsByTagName("select")[0].value;
	var bio = document.getElementsByTagName("textarea")[0].value;
	formData.append("photo", document.getElementById("avatar").files[0]);
	formData.append("sex",radio);
	formData.append("music",music);
	formData.append("color",color);
	formData.append("category",category);
	formData.append("bio",bio);
	
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST","/update_profile",true);
	xhttp.send(formData);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			Response(this.responseText);
		}
	}
}

function uploadgui(){
	document.getElementById("modal").style.display = "block";
}

function uploadclose(){
	document.getElementById("modal").style.display = "none";
}

function Response(text){
	var response;
	if(document.getElementById("modal").style.display != "block"){
		response = document.getElementById("responseForm");
	}
	else{
		response = document.getElementById("response");
	}
	response.innerHTML = text;
	var t = setTimeout(function (){ response.innerHTML = ""; }, 3000);
	response.addEventListener("click",function (){
		clearTimeout(t);
	});
}
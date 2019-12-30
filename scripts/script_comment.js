function appendContent(comment){
	var container = document.createElement("div");
	container.className = "comment_container";
	container.id = comment._id;
	let name = document.createElement("div");
	name.className = "comment_name";
	name.innerHTML = comment.user_name;
	name.user_id = comment.user_id;
	name.onclick = profile;
	container.appendChild(name);
	var votes = document.createElement("div");
	votes.className = "comment_votes";
	votes.innerHTML = comment.votes;
	container.appendChild(votes);
	let message = document.createElement("div");
	message.className = "message";
	message.innerHTML = comment.message;
	container.appendChild(message);
	let buttonup = document.createElement("button");
	buttonup.className = "up";
	buttonup.onclick = vote;
	if(user.clikes.includes(comment._id))
		buttonup.style.filter = "invert(100%)";
	container.appendChild(buttonup);
	let buttondown = document.createElement("button");
	buttondown.className = "down";
	buttondown.onclick = vote;
	if(user.cdislikes.includes(comment._id))
		buttondown.style.filter = "invert(100%)";
	container.appendChild(buttondown);
	if(user.admin){
		let buttondelete = document.createElement("button");
		buttondelete.className = "delete";
		buttondelete.onclick = deleteComment;
		container.appendChild(buttondelete);
	}
	comment_section.appendChild(container);
}

window.onload = function(){
	user = JSON.parse(localStorage.getItem('user'));
	post.comments.forEach(appendContent);
	comment_section = document.getElementById("comment_section").innerHTML;
}

function comment(){
	var message = document.getElementById("comment").value;
	document.getElementById("comment").value = '';
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/comment", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(`pid=${post._id}&message=${message}`);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			Response(this.responseText);
		}
	}
}

function profile(){
	var id = this.user_id;
	window.open(`/account?id=${id}`);
}

function updateUI(id,result){
	var figure = document.getElementById(id);
	var like = figure.querySelector(".up");
	var dislike = figure.querySelector(".down");
	var puncte = figure.querySelector(".comment_votes");
	switch(result){
		case "l":
			like.style.filter = "invert(100%)";
			puncte.innerHTML = Number(puncte.innerHTML) + 1;
			user.clikes.push(id);
			break;
		case "d":
			dislike.style.filter = "invert(100%)";
			puncte.innerHTML = Number(puncte.innerHTML) - 1;
			user.cdislikes.push(id);
			break;
		case "ul":
			like.style.filter = "invert(0%)";
			dislike.style.filter = "invert(0%)";
			puncte.innerHTML = Number(puncte.innerHTML) - 1;
			let l = user.clikes.findIndex(function(i){
					return i == id;
			});
			user.clikes.splice(l,1);
			break;
		case "ud":
			like.style.filter = "invert(0%)";
			dislike.style.filter = "invert(0%)";
			puncte.innerHTML = Number(puncte.innerHTML) + 1;
			let d = user.cdislikes.findIndex(function(i){
					return i == id;
			});
			user.cdislikes.splice(d,1);
			break;
	}
	localStorage.setItem('user',JSON.stringify(user));
}

function vote(){
	var xhttp = new XMLHttpRequest();
	var id = this.parentElement.id;
	var v;
	if(this.className == "up")
		v = 1;
	else
		v = 0;
	xhttp.open("GET", `/vote_comment?pid=${post._id}&id=${id}&vote=${v}`, true);
	xhttp.send();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			updateUI(id,this.responseText);
		}
	}
}

function deleteComment(){
	var xhttp = new XMLHttpRequest();
	var id = this.parentElement.id;
	xhttp.open("DELETE", `/delete_comment?pid=${post._id}&id=${id}`, true);
	xhttp.send();
	this.parentNode.parentNode.removeChild(this.parentNode);
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			alert(this.responseText);
		}
	}
}

function Response(text){
	document.getElementById("response").innerHTML = text;
	var t = setTimeout(function (){ document.getElementById("response").innerHTML = ""; }, 3000);
}
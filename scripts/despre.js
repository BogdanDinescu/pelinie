function goBack() {
	window.history.back();
}
window.onload = function(){
	var name = JSON.parse(localStorage.getItem("user")).name;
	document.getElementById("nume").innerHTML += name;
}
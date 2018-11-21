console.log("in modal");
$('#exampleModal').on('show.bs.modal', function(e) {
    console.log("Hey");
    var yourparameter1 = e.relatedTarget.dataset.deleteid;
});

invoke = (event) => {
    console.log("in delete")
    let nameOfFunction = this[event.target.name];
    let arg1 = event.target.getAttribute('data-arg1');
}
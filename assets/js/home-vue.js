var app = new Vue({
  el: '#app',
  data: {
    attdOrNot: isConfirmAttd,
    isVege: false,
    people: 1,
    others: '',
  },
  methods: {
    iDo: function () {
      if (!tid) return alert('ID NOT EXIST');
      var param = {
        tid: tid,
        attdOrNot: this.attdOrNot,
        isVege: this.isVege ? 1 : 0,
        people: this.people || 1,
        others: this.others || '',
        iGo: iGo
      };

      this.$http.post('/attdOrNot', param)
        .then(function (data) {
          console.log(data);
          if (data.body.code === 0) {
            alert('Success');
          } else {
            alert('Failed');
          }
        });
    }
  }
});

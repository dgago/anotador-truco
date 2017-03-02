class AnotadorController {
  public nos: number;
  public ellos: number;

  constructor() {
    this.nos = 0;
    this.ellos = 0;
  }

  public sumar(team: string) {
    if (team === "nos") {
      if (this.nos >= 30) {
        return;
      }
      this.nos++;
    } else {
      if (this.ellos >= 30) {
        return;
      }
      this.ellos++;
    }
  }

  public restar(team: string) {
    if (team === "nos") {
      if (this.nos <= 0) {
        return;
      }
      this.nos--;
    } else {
      if (this.ellos <= 0) {
        return;
      }
      this.ellos--;
    }
  }

  public nuevo() {
    if (confirm("¿Está seguro?")) {
      this.nos = 0;
      this.ellos = 0;
    }
  }
}

angular.module("app").component("anotador", {
  bindings: {},
  controller: AnotadorController,
  templateUrl: "cmp/anotador/anotador.html",
});

// JavaScript Document

class Node {
    name; //String
    startEarly; //int up left
    startLate; //int down left
    endEarly; //int up right
    endLate; //int down right
    optimistic; // int
    mostlikely; // int
    pessimistic; // int
    meanTime; // int
    slack;

    precesors = []; // Node[]
    sucesors = []; // Node[]
    precesorChars; // String[]

    constructor(name, precesorChars, optimistic, mostlikely, pessimistic) {
        this.name = name;
        this.precesorChars = precesorChars;
        this.optimistic = optimistic;
        this.mostlikely = mostlikely;
        this.pessimistic = pessimistic;
        this.meanTime = parseFloat(((optimistic + 4 * mostlikely + pessimistic) / 6).toFixed(2));
        this.startEarly = 0;
        this.startLate = 0;
        this.endEarly = 0;
        this.endLate = 0;
        this.slack = 0;
    }
}

class Graph {
    start; //Node
    end; //Node
    nodesList; // Node []

    constructor() {
        this.start = new Node("Initial", [], 0, 0, 0);
        this.end = new Node("Finish", [], 0, 0, 0);
        this.nodesList = [];
    }
    addNodes(data) {
        for (var i = 0; i < data.length; i++) {
            this.nodesList.push(
                new Node(
                    data[i]["name"],
                    (data[i]["precesors"] || "").split(","),
                    data[i]["optimistic"],
                    data[i]["mostlikely"],
                    data[i]["pessimistic"]
                )
            );
        }
    }

    setEdges() {
        for (var i = 0; i < this.nodesList.length; i++) {
            if (this.nodesList[i].precesorChars == "") {
                this.nodesList[i].precesors.push(this.start);
                this.start.sucesors.push(this.nodesList[i]);
            } else {
                for (var j = 0; j < this.nodesList[i].precesorChars.length; j++) {
                    for (var k = 0; k < this.nodesList.length; k++) {
                        if (this.nodesList[k].name == this.nodesList[i].precesorChars[j]) {
                            this.nodesList[i].precesors.push(this.nodesList[k]);
                            this.nodesList[k].sucesors.push(this.nodesList[i]);
                        }
                    }
                }
            }
        }

        for (var i = 0; i < this.nodesList.length; i++) {
            if (this.nodesList[i].sucesors.length == 0) {
                this.nodesList[i].sucesors.push(this.end);
                this.end.precesors.push(this.nodesList[i]);
            }
        }
    }

    calculateEarly() {
      function round2(num) {
          return parseFloat(num.toFixed(2));
      }

      for (var i = 0; i < this.nodesList.length; i++) {
          if (this.nodesList[i].precesors.length == 1) {
              this.nodesList[i].startEarly = round2(this.nodesList[i].precesors[0].endEarly);
              this.nodesList[i].endEarly = round2(this.nodesList[i].startEarly + this.nodesList[i].meanTime);
          } else {
              var max = 0;
              var pos = null;
              for (var j = 0; j < this.nodesList[i].precesors.length; j++) {
                  if (this.nodesList[i].precesors[j].endEarly > max) {
                      max = this.nodesList[i].precesors[j].endEarly;
                      pos = j;
                  }
              }
              if (pos != null) {
                  this.nodesList[i].startEarly = round2(this.nodesList[i].precesors[pos].endEarly);
                  this.nodesList[i].endEarly = round2(this.nodesList[i].startEarly + this.nodesList[i].meanTime);
              }
          }
      }

      if (this.end.precesors.length == 1) {
          var val = round2(this.end.precesors[0].endEarly);
          this.end.endLate = this.end.startLate = this.end.endEarly = this.end.startEarly = val;
      } else {
          var max = 0;
          var pos = null;
          for (var j = 0; j < this.end.precesors.length; j++) {
              if (this.end.precesors[j].endEarly > max) {
                  max = this.end.precesors[j].endEarly;
                  pos = j;
              }
          }
          if (pos != null) {
              var val = round2(this.end.precesors[pos].endEarly);
              this.end.endLate = this.end.startLate = this.end.endEarly = this.end.startEarly = val;
          }
      }
  }

  calculateLate() {
      function round2(num) {
          return parseFloat(num.toFixed(2));
      }

      for (var i = this.nodesList.length - 1; i >= 0; i--) {
          if (this.nodesList[i].sucesors.length == 1) {
              this.nodesList[i].endLate = round2(this.nodesList[i].sucesors[0].startLate);
              this.nodesList[i].startLate = round2(this.nodesList[i].endLate - this.nodesList[i].meanTime);
              this.nodesList[i].slack = round2(this.nodesList[i].endLate - this.nodesList[i].endEarly);
          } else {
              var min = Number.MAX_SAFE_INTEGER;
              var pos = null;
              for (var j = 0; j < this.nodesList[i].sucesors.length; j++) {
                  if (this.nodesList[i].sucesors[j].startLate < min) {
                      min = this.nodesList[i].sucesors[j].startLate;
                      pos = j;
                  }
              }
              if (pos != null) {
                  this.nodesList[i].endLate = round2(this.nodesList[i].sucesors[pos].startLate);
                  this.nodesList[i].startLate = round2(this.nodesList[i].endLate - this.nodesList[i].meanTime);
                  this.nodesList[i].slack = round2(this.nodesList[i].endLate - this.nodesList[i].endEarly);
              }
          }
      }
  }

    getDataMatrix() {
        var matrix = [];

        for (var i = 0; i < this.nodesList.length; i++) {
            var row = [];

            var precesorsTemp = [];
            for (var j = 0; j < this.nodesList[i].precesors.length; j++) {
                precesorsTemp.push(this.nodesList[i].precesors[j].name);
            }

            var sucesorsTemp = [];
            for (var j = 0; j < this.nodesList[i].sucesors.length; j++) {
                sucesorsTemp.push(this.nodesList[i].sucesors[j].name);
            }

            row["name"] = this.nodesList[i].name;
            row["precesors"] = precesorsTemp.join(",");
            row["optimistic"] = this.nodesList[i].optimistic;
            row["mostlikely"] = this.nodesList[i].mostlikely;
            row["pessimistic"] = this.nodesList[i].pessimistic;
            row["meanTime"] = this.nodesList[i].meanTime;
            row["slack"] = this.nodesList[i].slack;
            row["startEarly"] = this.nodesList[i].startEarly;
            row["startLate"] = this.nodesList[i].startLate;
            row["endEarly"] = this.nodesList[i].endEarly;
            row["endLate"] = this.nodesList[i].endLate;

            matrix.push(row);
        }

        return matrix;
    }

    getCriticalRoute(node, route) {
        if (node == this.end) {
            return route;
        } else {
            for (var i = 0; i < node.sucesors.length; i++) {
                if (node.sucesors[i].slack == 0) {
                    route += node.sucesors[i].name + "-";
                    return this.getCriticalRoute(node.sucesors[i], route);
                }
            }
        }
    }

    reset() {
        this.start = new Node("Initial", [], 0, 0, 0);
        this.end = new Node("Finish", [], 0, 0, 0);
        this.nodesList = [];
    }
}


function clearTable() {
    if (confirm("Are you sure you want to clear all entries?")) {
        dataTable = [];          // clear data array
        $('#iniTable').empty();  // clear HTML input table
        $('#finalTable').empty(); // clear output table
        $('#criticRoute').empty(); // clear critical path display
        graph.reset();           // reset graph
        $('#name').val("");      // clear input fields
        $('#precesors').val("");
        $('#optimistic').val("");
        $('#mostlikely').val("");
        $('#pessimistic').val("");
    }
}
function removeRow(index) {
    if (confirm("Are you sure you want to remove this row?")) {
        dataTable.splice(index, 1);  // remove the row from dataTable
        printIniTable();             // re-render the table
    }
}
// EDIT ROW
function editRow(index) {
    // Load row data into input fields
    $('#name').val(dataTable[index]["name"]);
    $('#precesors').val(dataTable[index]["precesors"]);
    $('#optimistic').val(dataTable[index]["optimistic"]);
    $('#mostlikely').val(dataTable[index]["mostlikely"]);
    $('#pessimistic').val(dataTable[index]["pessimistic"]);

    // Change button text and bind updateRow
    $('#addOrUpdateBtn').text('Update Row').off('click').on('click', function() {
        updateRow(index);
    });
}

// UPDATE ROW
function updateRow(index) {
    // Mandatory field check
    let name = $('#name').val();
    let optimistic = $('#optimistic').val();
    let mostlikely = $('#mostlikely').val();
    let pessimistic = $('#pessimistic').val();

    if (name !== "" && optimistic !== "" && mostlikely !== "" && pessimistic !== "") {
        // Update data
        dataTable[index]["name"] = name;
        dataTable[index]["precesors"] = $('#precesors').val() || "";
        dataTable[index]["optimistic"] = parseFloat(optimistic);
        dataTable[index]["mostlikely"] = parseFloat(mostlikely);
        dataTable[index]["pessimistic"] = parseFloat(pessimistic);
        dataTable[index]["meanTime"] = parseFloat(((dataTable[index]["optimistic"] + 4 * dataTable[index]["mostlikely"] + dataTable[index]["pessimistic"]) / 6).toFixed(2));

        // Reset input fields
        $('#name').val("");
        $('#precesors').val("");
        $('#optimistic').val("");
        $('#mostlikely').val("");
        $('#pessimistic').val("");

        // Reset button back to Add
        $('#addOrUpdateBtn').text('Add to the table').off('click').on('click', setDataRow);

        // Reprint table
        printIniTable();
    } else {
        alert("Fill in all the fields!");
    }
}


var graph = new Graph();
var dataTable = [];

function issetRow(name) {
    for (var i = 0; i < dataTable.length; i++) {
        if (dataTable[i]["name"] == name) {
            return true;
        }
    }
    return false;
}

// SET DATA ROW (Add new)
function setDataRow() {
    let name = $('#name').val();
    let optimistic = $('#optimistic').val();
    let mostlikely = $('#mostlikely').val();
    let pessimistic = $('#pessimistic').val();

    if (name !== "" && optimistic !== "" && mostlikely !== "" && pessimistic !== "") {
        if (!issetRow(name)) {
            let row = {
                name: name,
                precesors: $('#precesors').val() || "",
                optimistic: parseFloat(optimistic),
                mostlikely: parseFloat(mostlikely),
                pessimistic: parseFloat(pessimistic),
                meanTime: parseFloat(((parseFloat(optimistic) + 4 * parseFloat(mostlikely) + parseFloat(pessimistic)) / 6).toFixed(2))
            };
            dataTable.push(row);

            // Reset input fields
            $('#name').val("");
            $('#precesors').val("");
            $('#optimistic').val("");
            $('#mostlikely').val("");
            $('#pessimistic').val("");

            printIniTable();
        } else {
            alert("Duplicate name found!");
        }
    } else {
        alert("Fill in all the fields!");
    }
}

// Bind the Add button initially
$('#addOrUpdateBtn').on('click', setDataRow);
function printIniTable() {
    $('#iniTable').empty();
    for (var i = 0; i < dataTable.length; i++) {
        $('#iniTable').append(
            "<tr><td>" + dataTable[i]["name"] + "</td>" +
            "<td>" + dataTable[i]["precesors"] + "</td>" +
            "<td>" + dataTable[i]["optimistic"] + "</td>" +
            "<td>" + dataTable[i]["mostlikely"] + "</td>" +
            "<td>" + dataTable[i]["pessimistic"] + "</td>" +
            "<td>" + dataTable[i]["meanTime"] + "</td>" +
            "<td>" +
                "<button class='btn btn-sm btn-warning mr-1' onclick='editRow(" + i + ")'>Edit</button>" +
                "<button class='btn btn-sm btn-danger' onclick='removeRow(" + i + ")'>Remove</button>" +
            "</td>" +
            "</tr>"
        );
    }
}

function processIniTable() {
    graph.reset();
    graph.addNodes(dataTable);
    graph.setEdges();
    graph.calculateEarly();
    graph.calculateLate();
    var route = graph.getCriticalRoute(graph.start, "").split("-");

    var routeString = "";
    for (var i = 0; i < route.length - 2; i++) {
        routeString += '<span class="badge badge-pill badge-success">Activity ' + route[i] + '</span> ' + (i < route.length - 3 ? ' -> ' : '');
    }

    $('#criticRoute').html(routeString);
    // Calculate total duration of critical path
    var totalDuration = 0;
    for (var i = 0; i < route.length; i++) {
        if (route[i] === "") continue; // skip empty strings
        for (var j = 0; j < graph.nodesList.length; j++) {
            if (graph.nodesList[j].name === route[i]) {
                totalDuration += graph.nodesList[j].meanTime;
                break;
            }
        }
    }

    // Display total duration below critical path
    $('#criticRoute').append('<br><strong>Total Duration: ' + totalDuration.toFixed(2) + ' Days</strong>');

    printFinalTable(route);  // pass route here
}

function printFinalTable(route) {
    $('#finalTable').empty();
    var matrix = graph.getDataMatrix();
    for (var i = 0; i < matrix.length; i++) {
        var string =
            "<td>" + matrix[i]["name"] + "</td>" +
            "<td>" + matrix[i]["precesors"] + "</td>" +
            "<td>" + matrix[i]["meanTime"] + "</td>" +
            "<td>" + matrix[i]["slack"] + "</td>" +
            "<td>" + matrix[i]["startEarly"] + "</td>" +
            "<td>" + matrix[i]["startLate"] + "</td>" +
            "<td>" + matrix[i]["endEarly"] + "</td>" +
            "<td>" + matrix[i]["endLate"] + "</td>";

        $('#finalTable').append("<tr>" + string + "</tr>");
    }
    printGraph(route);
}

function printGraph(route) {
    var matrix = graph.getDataMatrix();
    var nodes = [];
    for (var i = 0; i < matrix.length; i++) {
        nodes.push({
            id: matrix[i]["name"],
            level: 2,
            label:
                "Activities " + matrix[i]["name"] + "\n\n" +
                "Duration: " + matrix[i]["meanTime"]
                //"Slack: " + matrix[i]["slack"] + "\n" +
                //"Start Early: " + matrix[i]["startEarly"] + "\n" +
                //"End Late: " + matrix[i]["startLate"] + "\n" +
                //"End Early: " + matrix[i]["endEarly"] + "\n" +
                //"End Late: " + matrix[i]["endLate"]
        });
    }
    nodes.push({
        id: graph.start.name,
        label: graph.start.name,
        color: { background: '#dc3545' },
        level: 1,
    });
    nodes.push({
        id: graph.end.name,
        label:
            graph.end.name + "\n\n" +
            "Start Early: " + graph.end.startEarly + "\n" +
            "Start Late: " + graph.end.startLate + "\n" +
            "End Early: " + graph.end.endEarly + "\n" +
            "End Late: " + graph.end.endLate,
        color: { background: '#dc3545' },
        level: 3,
    });
    nodes = new vis.DataSet(nodes);

    var edges = [];

    function isCriticalEdge(fromNode, toNode, route) {
        for (var k = 0; k < route.length - 1; k++) {
            if (route[k] === fromNode && route[k+1] === toNode) {
                return true;
            }
        }
        return false;
    }

    // build normal activity edges
    for (var i = 0; i < graph.nodesList.length; i++) {
        for (var j = 0; j < graph.nodesList[i].sucesors.length; j++) {
            var fromNode = graph.nodesList[i]["name"];
            var toNode = graph.nodesList[i].sucesors[j].name;
            edges.push({
                from: fromNode,
                to: toNode,
                color: isCriticalEdge(fromNode, toNode, route) ? 'black' : undefined
            });
        }
    }

    // build edges from start node
    for (var i = 0; i < graph.start.sucesors.length; i++) {
        var fromNode = graph.start.name;
        var toNode = graph.start.sucesors[i].name;

        edges.push({
            from: fromNode,
            to: toNode,
            color: (toNode === route[0])
                     ? 'black'
                     : (isCriticalEdge(fromNode, toNode, route) ? 'black' : undefined)
        });
    }


    // convert only after everything is added
    edges = new vis.DataSet(edges);


    var container = document.getElementById('mynetwork');

    var data = { nodes: nodes, edges: edges };
    var options = {
        edges: {
            arrows: { to: { enabled: true } }
        },
        nodes: {
            shape: 'box',
            physics: false,
            color: {
                border: '#007bff',
                background: '#28a745',
                highlight: {
                    border: '#007bff',
                    background: '#28a745'
                },
            },
            font: {
                color: '#ffffff',
                bold: { color: '#ffffff' },
            },
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            hideEdgesOnDrag: false,
            hideEdgesOnZoom: false,
            hideNodesOnDrag: false,
            hover: false,
            hoverConnectedEdges: false,
            keyboard: {
                enabled: false,
                speed: { x: 10, y: 10, zoom: 0.02 },
                bindToWindow: true
            },
            multiselect: false,
            navigationButtons: false,
            selectable: false,
            selectConnectedEdges: false,
            tooltipDelay: 10,
            zoomSpeed: 1,
            zoomView: true
        }
    };
    var network = new vis.Network(container, data, options);
}

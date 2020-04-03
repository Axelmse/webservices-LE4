class Places {

  constructor(data) {
    this.data = data;
  }

  configure(app) {
    const data = this.data;
    var validation = require("mw.validation");
    
    app.options('/api/places', function(request, response) {
      response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.header('Access-Control-Allow-Methods', 'GET,POST');
      response.header('Access-Control-Allow-Headers', 'Content-Type, my-header-custom');
      response.header("Cache-Control", "max-age=45");
      response.json();
    });
    
    app.get("/api/places", function(request, response) {
      response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.header('Access-Control-Allow-Methods', 'GET,POST');
      response.header('Access-Control-Allow-Headers', 'Content-Type, my-header-custom');
      response.header("Cache-Control", "max-age=15");
      response.json;
      return data.getPlacesAsync().then(function(places) {
        if (places !== undefined) {
          response.status(200).json({
            "places": places
          });
          return;
        }
        response.status(404).json({
          key: "entity.not.found"
        });
      });
    });

    app.get("/api/places/:id", function(request, response) {
      let id = request.params.id;
      return data.getPlaceAsync(id).then(function(place) {
        if (place !== undefined) {
          response.status(200).json(place);
          return;
        }
        response.status(404).json({
          key: "entity.not.found"
        });
      });
    });
		
		
    app.post("/api/places", function(request, response) {
      
			let place = request.body;

      var onlyIf = function(){
        if(place.image && place.image.url){
          return true;
        }
        return false;
			}

			const rules = {
        id: ["required"],
				name: [
					"required",
					{ minLength: { minLength: 3 }},
					{ maxLength: { maxLength: 100 }},
          { pattern: { regex: /^[a-zA-Z -]*$/ }}
        ],
				author: [
					"required",
					{ minLength: { minLength: 3 }},
					{ maxLength: { maxLength: 100 }},
          { pattern: { regex: /^[a-zA-Z -]*$/ }}
        ],
				review: ["required", "digit"],
				"@image": {
					url: ["url"],
					title: [{ 
						required: {
                onlyIf: onlyIf,
								message: "Field Image title is required",
            },
            minLength: { minLength: 3 },
					  maxLength: { maxLength: 100 },
            pattern: { regex: /^[a-zA-Z -]*$/ },
          }]
        } 
			};

			var validationResult = validation.objectValidation.validateModel(
				place,
				rules,
				true
			);

      if (!validationResult.success) {
        console.log(validationResult.detail);
				response.status(400).json({
          key: "There are unrespected rules"
        });
      }

      return data.savePlaceAsync(place).then(function(id) {
        response.setHeader("Location",/places/);
        if(id !== undefined){
          response.status(201).json(id);
          return;
        }
        response.status(400).json({
          key : "entity.not.valid"
        });
      })
    });


    app.delete("/api/places/:i", function(request, response){
      let id = request.params.id;

      return data.deletePlaceAsync(id).then(function(deleted) {
        if (deleted !== undefined) {
          response.status(204).json({
            key: "deleted"
          });
          return;
        }
        response.status(404).json({
          key: "entity.not.found"
        });
      });
    });


    app.put("/api/places/:i", function(request, response){
      let id = request.params.id;
      var place = request.body;

      var onlyIf = function(){
        if(place.image && place.image.url){
          return true;
        }
        return false;
			}

			const rules = {
        id: ["required"],
				name: [
					"required",
					{ minLength: { minLength: 3 }},
					{ maxLength: { maxLength: 100 }},
          { pattern: { regex: /^[a-zA-Z -]*$/ }}
        ],
				author: [
					"required",
					{ minLength: { minLength: 3 }},
					{ maxLength: { maxLength: 100 }},
          { pattern: { regex: /^[a-zA-Z -]*$/ }}
        ],
				review: ["required", "digit"],
				"@image": {
					url: ["url"],
					title: [{ 
						required: {
                onlyIf: onlyIf,
								message: "Field Image title is required",
            },
            minLength: { minLength: 3 },
					  maxLength: { maxLength: 100 },
            pattern: { regex: /^[a-zA-Z -]*$/ },
          }]
        } 
			};

			var validationResult = validation.objectValidation.validateModel(
				place,
				rules,
				true
			);

      if (!validationResult.success) {
        console.log(validationResult.detail);
				response.status(400).json({
          key: "There are unrespected rules"
        });
      }

      return data.savePlaceAsync(place).then(function(id) {
        if (id !== undefined) {
          response.status(204).json(id);
          return;
        }
        response.status(404).json({
          key: "entity.not.found"
        });
      });
    });

    app.patch("/api/places/:id", function(request, response){
      response.setHeader("Location","places");

      let id = request.params.id;
      let place = request.body;

      let onlyIf = function() {
				return !!(place.image && place.image.url);
			};

      if(request.headers["content-type"].includes("application/merge-patch+json")){
        return data.getPlaceAsync(id).then(secondPlace => {
					if (secondPlace === undefined) {
						response.status(404).json(id);
						return;
					}
					secondPlace = applyPatch(secondPlace, place).newDocument;
					return data.savePlaceAsync(secondPlace).then(id => {
						response.status(200).json(secondPlace);
						return;
					});
				});
      }

      let rules = {
				name: [
					"required",
					{ minLength: { minLength: 3 } },
					{ maxLength: { maxLength: 100 } },
					{ pattern: { regex: /^[a-zA-Z -]*$/ } }
				],
				author: [
					"required",
					{ minLength: { minLength: 3 } },
					{ maxLength: { maxLength: 100 } },
					{ pattern: { regex: /^[a-zA-Z -]*$/ } }
				],
				review: ["required", "digit"]
			};

      let result = validation.objectValidation.validateModel(
				place,
				rules
      );
      
      if (!result.success) {
				response.status(400).json();
				return;
			}
      
      if (place.image) {
				let rules2 = {
					url: ["url"],
					title: [
						{
							required: {
								onlyIf: onlyIf,
								message: "Field Image title is required"
							}
						},
						{ minLength: { minLength: 3 } },
						{ maxLength: { maxLength: 100 } },
						{ pattern: { regex: /^[a-zA-Z -]*$/ } }
					]
				};

				result = validation.objectValidation.validateModel(
					place.image,
					rules2
				);

				if (!result.success) {
					response.status(400).json();
					return;
				}
      }
      
      place.id = id;
			return data.getPlaceAsync(id).then(place2 => {
				if (place2 === undefined) {
					response.status(404).json(id);
					return;
				}

				Object.assign(place2, place);
				return data.savePlaceAsync(place2).then(id => {
					response.status(204).json();
					return;
        });
      });
    });
  }
}
module.exports = Places;
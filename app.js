/*
http://ricostacruz.com/backbone-patterns/
*/
var app = app || {};

_.extend(Backbone.Validation.callbacks, {
    //http://jsfiddle.net/thedersen/udXL5/
   
    _clearErrors: function(view, attr) {
        var $el = view.$('[data-id=' + attr + ']');
        var $field = $el.closest('.field');
        $field.removeClass('error');
        console.log('prompt', $field.find('.prompt'));
        $field.find('.prompt').remove();
    },
    valid: function(view, attr, selector) {
        this._clearErrors(view, attr);
    },
    invalid: function(view, attr, error, selector) {
        this._clearErrors(view, attr);

        var $el = view.$('[data-id=' + attr + ']');
        var $field = $el.closest('.field');

        $field.addClass('error');
        $field.append('<div class="ui red pointing prompt label transition visible">'+error+'</div>');
    }
});


//model
app.Movie = Backbone.Model.extend({
    defaults: {
        title: '',
        genre: '',
        year: '',
        summary: '',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg',
        youtubeTrailer: ''
    },
    validation: {
        title: {
            required: true,
            msg: 'The title Title is required'
        },
        year: {
            range: [1900, 2050]
        }
    }
});

//collection
app.Movies = Backbone.Collection.extend({
    model: app.Movie,
    localStorage: new Backbone.LocalStorage('movies-backbone'),
    findByGenre: function(genre) {
        return this.models.filter(function(movie) {
            return movie.get('genre') == genre;
        });
    }
});

//listitemview
app.ListItemView = Backbone.View.extend({
    events: {
        'click .jsDelete': 'deleteItem'
    },
    tagName: 'div',
    className: 'item',
    template: _.template($('#tplListItemView').html()),
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    deleteItem: function(event) {
        var that = this;
        $('#modalDelete')
          .modal({
            closable  : false,
            onDeny    : function(){
              //return false; prevents dialog from closing
            },
            onApprove : function() {
                that.model.destroy();
                that.remove(); //Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.        
            }
          })
          .modal('show');
    }
});

//listview
app.ListView = Backbone.View.extend({
    el: '#movieslist',
    initialize: function() {
        //this.collection = new app.Movies(initialMovies);
        this.collection.fetch(); //fetch collection van server, nodig anders zie je de collectie niet
        this.render();
        this.listenTo(this.collection, 'add', this.renderMovie);
        //this.listenTo(this.collection, 'reset', this.render);
    },
    render: function() {
        this.collection.each(function(item) {
            this.renderMovie(item);
        }, this);
    },
    renderMovie: function(item) {
        var movieView = new app.ListItemView({
            model: item
        });
        this.$el.append(movieView.render().el);
    }
});

app.addMovieView = Backbone.View.extend({
    /*
    <div class="ui form segment" id="frmAddMovie">
    */
    tagName: 'div',
    id: '#frmAddMovie',
    className: 'ui form segment',
    events: {
        'click #addMovie': 'addMovie',
        'blur input': 'checkModel'
    },
    template: _.template($('#tplAddMovie').html()),
    initialize: function() {
        this.render();
        return this;
    },
    render: function() {
        this.$el.html(this.template());
        Backbone.Validation.bind(this);
        return this;
    },
    addMovie: function(event) {
        event.preventDefault();
        var formData = {};

        this.$el.find('[data-id]').each(function(i, el) {
            var $el = $(el);
            var dataId = $el.attr('data-id');
            if (dataId) {
                formData[dataId] = $el.val();
            }
        });

        this.model.set(formData);
        if (this.model.isValid(true)) {
            this.collection.create(formData);

            this.$el.find('[data-id]').each(function(i, el) {
                $(el).val('');
            });
        }
    },
    _clearErrors: function($el) {
        var $field = $el.closest('.field');
        $field.removeClass('error');
        $field.find('.prompt').remove();
    },
    valid: function($el) {
        this._clearErrors($el);
    },
    invalid: function($el, error) {
        this._clearErrors($el);
        var $field = $el.closest('.field');
        $field.addClass('error');
        $field.append('<div class="ui red pointing prompt label transition visible">'+error+'</div>');
    },
    checkModel: function(event) {
        console.clear();
        /* check if model is valid */
        var $el = $(event.target);
        var dataId = $el.attr('data-id');

        var error = this.model.preValidate(dataId, $el.val());
        if (error) {
            this.invalid($el, error);
        } else {
            this.valid($el);
        }

        //this.model.set(dataId, $el.val(), {validate:true});
        console.log(dataId, $el.val());
        //console.log(this.model.attributes);
    }
});

app.GenresView = Backbone.View.extend({
    el: '#genresView',
    genres: [],
    initialize: function(options) {
        this.collection = options.collection;
        this.genres = options.genres;
        this.render();

        this.listenTo(this.collection, 'all', this.render);
    },
    render: function() {
        var html = '';

        this.genres.forEach(function(item) {
            var length = this.collection.findByGenre(item).length;
            /*
            this.$el.append(
                '<a class="item">' + item + ' <div class="ui label">' + length + '</div></a>'
            );
			*/
            html += '<a class="item">' + item + ' <div class="ui label">' + length + '</div></a>';
        }, this);

        this.$el.html(html);
    }
});


$(function() {
    var genres = ['Action', 'Comedy', 'Drama', 'Adventure'];
    genres.sort(function(a, b) {
        if (a < b) return -1;
        if (b < a) return 1;
        return 0;
    });

    var movies = [];
    movies.push({
        title: 'Jurassic Park',
        genre: 'Adventure',
        year: 1993,
        summary: 'During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg'

    });

    movies.push({
        title: 'The Shawshank Redemption',
        genre: 'Drama',
        year: 1994,
        summary: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BODU4MjU4NjIwNl5BMl5BanBnXkFtZTgwMDU2MjEyMDE@._V1_SX214_AL_.jpg'
    });

    //app.movies = new app.Movies(movies);
    app.movies = new app.Movies();

    app.movies.fetch();

    $('#leftCol').append($('#tplGenresView').html());

    var genresView = new app.GenresView({
        collection: app.movies,
        genres: genres
    });

    $('#header').html($('#tplHeader').html());

    var listView = new app.ListView({
        collection: app.movies
    });

    var frmAddMovieView = new app.addMovieView({
        collection: app.movies,
        model: new app.Movie()
    });
    $('#content').prepend(frmAddMovieView.render().el);

    _.each(genres, function(genre) {
        $('#ddlGenres').append('<option value="' + genre + '">' + genre + '</option>');
    });
    $('select.dropdown').dropdown();
});
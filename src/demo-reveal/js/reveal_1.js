(function(){
    "use strict";

    /**
     * Purpose:
     *
     * Use GSAP `TimelineLite` to demonstrate use of animation timelines to build complex transitions.
     * Use GSAP-AngularJS Timeline DSL to parse and build timeline transitions
     *
     */
    angular.module("gridReveal",['gsTimelines','ng'])
        .controller("RevealController", RevealController )
        .factory(   "catalog",          AlbumCatalog );

    /**
     * RevealController constructor
     * @constructor
     */
    function RevealController( $scope, catalog, $timeline, $timeout, $q, $log ) {

        $scope.pulse       = 0.02;
        $scope.catalog     = catalog;
        $scope.album       = catalog[0];
        $scope.showDetails = showDetails;
        $scope.hideDetails = hideDetails;
        $scope.confirmContinue = confirmContinue;

        enableAutoClose();

        // wait while reflow finishes
        wait( 800 )
          .then( function() { return showDetails( $scope.album );})
          .then( function() { return wait( 300 );                })
          .then( hideDetails );

        // ************************************************************
        // Show Tile features
        // ************************************************************

        /**
         * Zoom the `#details` view simply by setting a $scope.state variable
         *
         */
        function showDetails( album ) {
            var nextState = 'zoom';
            var message   = "RevealController::showDetails() >> trigger '{0}' animation for '{1}'";
            var request   = promiseToNotify( "zoom", "complete." );

            $log.debug(message.supplant([nextState,  album.aria.artist ]));

                $timeline( "zoom", {
                    onUpdate          : makeNotify("zoom", "updating..."),
                    onComplete        : request.notify
                });

            $scope.timeScale = 1.0;
            $scope.album     = album;
            $scope.state     = nextState;  // Perform animation via state change

            return request.promise;
        }

        /**
         *  Unzoom the `#details` view simply by clearing the state
         */
        function hideDetails() {
            var state = 'zoom';
            var album = $scope.album;
            var request = promiseToNotify( state, "reversed." );
            var message   = "RevealController::hideDetails() >> trigger '{0}' animation for '{1}'";

            $log.debug(message.supplant([state,  album.aria.artist]));

                $timeline( state, {
                    onUpdate          : makeNotify(state, "reversing..."),
                    onReverseComplete : request.notify,
                    onComplete        : null
                });

            $scope.state = "-" + state;

            return request.promise;
        }

        function confirmContinue()
        {
            $log.debug("RevealController::confirmContinue()");

            var deferred = $q.defer();

            $timeout(function() {

                $log.debug("RevealController::confirmContinue() - confirmed");
                deferred.resolve( true );

            },3000, false);


            return deferred.promise;

        }


        // ************************************************************
        // Other Features - autoClose and Scaling
        // ************************************************************

        function promiseToNotify(direction, action) {
            var deferred = $q.defer();

            return {
                promise : deferred.promise,
                notify  : function(tl){
                    $log.debug( "tl('{0}') {1}".supplant([direction, action || "finished"]));
                    deferred.resolve(tl);
                }
            };
        }
        /**
         * Reusable animation event callback for logging
         * @returns {Function}
         */
        function makeNotify (direction, action) {
            return function(tl) {
                $log.debug( "tl('{0}') {1}".supplant([direction, action || "finished"]));
            };
        }

        /**
         * Add Escape key and mousedown listeners to autoclose/reverse the
         * zoom animations...
         */
        function enableAutoClose() {
            $('body').keydown( autoClose );
            $('#mask').mousedown( autoClose );
            $('#details').mousedown( autoClose );
        }

        /**
         * Auto-close details view upon ESCAPE keydowns
         */
        function autoClose(e) {
            if ((e.keyCode == 27) ) {
                ($scope.hideDetails || angular.noop)();
                e.preventDefault();
            }
        }

        /**
         * Simply utility function wait with a promise
         * @param delay
         * @returns {Deferred.promise|*}
         */
        function wait (delay, value) {
            var deferred = $q.defer();
            $timeout(function(){
                deferred.resolve( value || true );
            },delay,false);
            return deferred.promise;
        }

    }

    /**
     * Tile DataModel factory for model data used in Tile animations
     * @constructor
     *
     * CDN Prefix:     http://solutionoptimist-bucket.s3.amazonaws.com/kodaline
     * Local Prefix:   ./assets/images/koda
     */
    function AlbumCatalog() {
        return [
            {
                className : "pharrell",
                aria : {
                    artist: "Pharrell Williams",
                    album : "GIRL"
                },
                from: {
                    left:517,
                    top: 302,
                    width: 338,
                    height: 299
                },
                to: {
                    left:106,
                    top:229,
                    width:641,
                    height:547
                },
                // Layout position when the album and playlist switch out
                switchOver : {
                    width:242,
                    height:243,
                    top:240,
                    left:320
                },
                playlist : "http://solutionoptimist-bucket.s3.amazonaws.com/kodaline/pharrell/playlist.png"
            }
        ];
    }


})();

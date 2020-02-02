const got = require('got')

const key = process.env.GOOGLE_DIRECTIONS_API_KEY || 'AIzaSyB4TTDXKtAFzCR-Fz3pCxmD1zVhEQjq0ow'
const endpoint = 'https://maps.googleapis.com/maps/api/directions/json'

let response

/**
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */

exports.lambdaHandler = async (req, ctx) => {
  if (!req.queryStringParameters ||
  !req.queryStringParameters.origin ||
  !req.queryStringParameters.destination) {
    return {
      'statusCode': 400,
      'headers': {
        'content-type': 'application/json',
      },
      'body': JSON.stringify({
        success: false,
        message: 'Please provide all required parameters.',
        parameters: {
          'origin': 'your starting location',
          'destination': 'your destination location',
          'route': 'keyword description usually a main road (optional but recommended)',
          'threshold': 'minutes over usual time from whish it is counted as traffic (optional)'
        },
        example: '?origin=Lange Laube 16, 30159 Hannover&destination=Welfengarten 1, 30167 Hannover'
      })
    }
  }

  try {
    const origin = req.queryStringParameters.origin
    const destination = req.queryStringParameters.destination
    const routeSummary = req.queryStringParameters.route || null
    let threshold = req.queryStringParameters.threshold || null

    const url = `${endpoint}?origin=${origin}&destination=${destination}&departure_time=now&alternatives=true&key=${key}`
    const mapsResult = await got(url).json()
    console.log('GOOGLE_MAPS_API_URL:', url)

    // TODO search for expected route, since it shouldnt be the first one if traffic occurs
    // propably have to splice into mutliple routes in order to force it to work like expected
    let route
    if (routeSummary) {
      mapsResult.routes.forEach(item => {
        if (item.summary.includes(routeSummary)) {
          route = item
        }
      })
    } else {
      route = mapsResult.routes[0]
    }

    if (route) {
      let result = false
      const duration = route.legs[0].duration.value
      const durationInTraffic = route.legs[0].duration_in_traffic.value
      if (!threshold) threshold = duration*1.2
      if (durationInTraffic > (duration + threshold)) result = true

      return {
        'statusCode': 200,
        'headers': {
          'content-type': 'application/json',
        },
        'body': JSON.stringify({
          success:true,
          isTraffic: result,
          route: route
        })
      }
    } else {
      return {
        'statusCode': 404,
        'headers': {
          'content-type': 'application/json',
        },
        'body': JSON.stringify({
          success: false,
          message: 'Route not found.',
          routes: mapsResult.routes
        })
      }
    }
  } catch (err) {
    console.log(err)
    return {
      'statusCode': 500,
      'body': JSON.stringify({
        success: false,
        message: 'Internal server error.'
      })
    }
  }
}

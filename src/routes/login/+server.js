import { login } from 'studentvue.js'
import cookie from 'cookie'

export async function POST({ request }) {
	console.log('post login')

	const body = await request.json()
	let result

	try {
		let client = await login(body.districtUrl, body.username, body.password)
		result = await Promise.all([
			client.getStudentInfo().then((value) => JSON.parse(value).StudentInfo),
			client.getGradebook().then((value) => JSON.parse(value).Gradebook),
		])

		if (!result[0]) {
			throw new Error('No data returned')
		}
	} catch (error) {
		console.log(error)
		return new Response(null, {
			status: 401
		})
	}

		const currentPeriod = 0;

	return new Response(
		JSON.stringify({
			student: result.shift(),
			periods: result,
			currentPeriod
		}),
		{
			headers: {
				'Set-Cookie': cookie.serialize(
					'auth',
					Buffer.from(body.username).toString('base64') +
						':' +
						Buffer.from(body.password).toString('base64') +
						':' +
						Buffer.from(body.districtUrl).toString('base64'),
					{
						httpOnly: true,
						maxAge: 60 * 60 * 24 * 30,
						sameSite: 'strict',
						path: '/'
					}
				)
			}
		}
	)
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class API {
	public static uploadImage = async (_file: File) => {
		console.log(_file, "file");
		console.log(
			"Image upload is disabled in the demo... Please implement the API.uploadImage method in your project.",
		);
		await new Promise((r) => setTimeout(r, 500));
		return "https://robohash.org/2001:4860:7:622::ff.png";
	};
}

export default API;

const post_schema = require('../model/post_schema.js');
const {User} = require('../model/User_Model.js');
const cloudinary = require('cloudinary').v2;

const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id.toString();
    console.log(userId)
    // console.log(userId);

    const user = await User.findById(userId);
    console.log(user)

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Please enter text or image" });
    }

    // let imageUrl = "";
    // let {img}  = req.body;
    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url; // ✅ Fixed typo
    }

    const newPost = new post_schema({
      user: userId,
      text,
      img: imageUrl, // ✅ Assign uploaded image URL
    });

    await newPost.save();

    res.status(200).json({ message: "Post created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id; // ✅ Renamed to camelCase
        const post = await post_schema.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const user = await User.findById(req.user._id.toString());
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Fixed missing closing bracket
        if (post.user.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "You are not the owner of this post" });
        }
        if(post.img){
            const imageId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imageId);
        }

        await post.deleteOne(); // ✅ Correct deletion method
 // ✅ Deleting the post
        return res.status(200).json({ message: "Post deleted successfully" }); // ✅ Success response
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const commentPost = async (req,res) =>{
    try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await post_schema.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };
console.log(comment)

		post.comment.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
module.exports = {createPost, deletePost, commentPost} // ✅ Correct export

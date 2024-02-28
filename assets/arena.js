// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script')
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
document.head.appendChild(markdownIt)



// Okay, Are.na stuff!
let channelSlug = 'physical-touchpoints' // The “slug” is just the end of the URL

// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.getElementById('channel-title')
	let channelDescription = document.getElementById('channel-description')
	// let channelCount = document.getElementById('channel-count')
	// let channelLink = document.getElementById('channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	// channelCount.innerHTML = data.length
	// channelLink.href = `https://www.are.na/channel/${channelSlug}`

}



// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.getElementById('channel-blocks')

	// Links!
	if (block.class == 'Link') {
		let linkItem =
			`
			<li class="block block--link">
				<picture>
					<source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
					<source media="(max-width: 640px)" srcset="${ block.image.large.url }">
					<img src="${ block.image.original.url }">
				</picture>
				<h3 class="link-title">${ block.title }</h3>
				<div class="link-description">${ block.description_html }</div>
				<div class="link-button"><button><a href="${ block.source.url }"> Read original </a></button></div>
			</li>
			`
			let linkBlocks = document.getElementById('block--link')
			linkBlocks.insertAdjacentHTML('beforeend', linkItem)
	}

	// Images!
	else if (block.class == 'Image') {
		let imageItem =
			`
			<li class="block block--image">
				<figure> 
						<img src="${ block.image.original.url }" alt ="by ${ block.author}">
					</div> 
					<figcaption> ${ block.title }</figcaption> 
					<div  class="block--image__description"> 
					${block.description_html
					}</div>
			</li>
			`

			let imageBlocks = document.getElementById('block--image')
			imageBlocks.insertAdjacentHTML('beforeend', imageItem)
	}

	// Text!
	else if (block.class == 'Text') {
		let textItem= 
		`
		<ul class="block block--text"> 
				<div class="outershell">
					<div class="display"> 
						<div class="text_block_title"> ${block.generated_title}
						</div> 
						<p class="text-content">${block.content_html}</p>
					</div> 	
					<div class="appleLogo"> <img src="assets/images/Apple logo.png" alt="" </div>  
				</div> 
		<ul> 
		`
		let textBlocks = document.getElementById('block--text')
		textBlocks.insertAdjacentHTML('beforeend', textItem)
		
	}

	// Uploaded (not linked) media…
	else if (block.class == 'Attachment') {
		let attachment = block.attachment.content_type // Save us some repetition

		// Uploaded videos!
		if (attachment.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			let videoItem =
				`
				<li class="block block--video">
					<video class="thumbnail-video" controls src="${ block.attachment.url }"></video>
					<div class="title-video"> ${block.generated_title}</div>
				</li>
				`
			let videoBlocks = document.getElementById('block--video')
			videoBlocks.insertAdjacentHTML('beforeend', videoItem)
			// More on video, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}

		// Uploaded PDFs!
		else if (attachment.includes('pdf')) {
			// …up to you!
		}

		// Uploaded audio!
		else if (attachment.includes('audio')) {
			console.log(block)
			// …still up to you, but here’s an `audio` element:
			let audioItem =
				`
				<li class="block block--audio">
				<p class="audio-title">${block.generated_title}</p> 
					<audio class="audio-player" controls src="${ block.attachment.url }"></video>
				</li>
				`
			let audioBlocks = document.getElementById('block--audio')
			audioBlocks.insertAdjacentHTML('beforeend', audioItem)
			// More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}

	// Linked media…
	else if (block.class == 'Media') {
		let embed = block.embed.type

		// Linked video!
		if (embed.includes('video')) {
			console.log(block)
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li class="block block--video--embed">
					<div class="title-video-embed"> 
						${block.generated_title}
					</div>
					<div class="thumbnail-video-embed">
						${ block.embed.html }
					</div>
				</li>
				`
			let linkedVideoblocks = document.getElementById('block--video--embed')
			linkedVideoblocks.insertAdjacentHTML('beforeend', linkedVideoItem)
			// More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}

		// Linked audio!
		else if (embed.includes('rich')) {
			let linkedAudioItem =
				`
				<li>
				<div class="title"> ${block.generated_title}</div>
					${ block.embed.html }
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', linkedAudioItem)
		}
	}
}



// It‘s always good to credit your work:
let renderUser = (user, container) => { // You can have multiple arguments for a function!
	let userAddress =
		`
		<address class="authors">
			<img src="${ user.avatar_image.display }">
			<h3 class="users">${ user.first_name }</h3>
			<p><a href="https://are.na/${ user.slug }">Are.na profile ↗</a></p>
		</address>
		`
	container.insertAdjacentHTML('beforeend', userAddress)
}



// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json()) // Return it as JSON data
	.then((data) => { // Do stuff with the data
		// console.log(data) // Always good to check your response!
		placeChannelInfo(data) // Pass the data to the first function


		// Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
		data.contents.reverse().forEach((block) => {
			// console.log(block) // The data for a single block
			renderBlock(block) // Pass the single block data to the render function
		})

		// Also display the owner and collaborators:
		let channelUsers = document.getElementById('channel-users') // Show them together
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)

		let switchButtons = document.querySelector('.block--image button')
		switchButtons.forEach((switchButton) => {
			switchButton.onclick = () => { 
				switchButton.parentElement.classList.toggle(active)
			}
		})

	})

        let a;
        let time;
        setInterval(() => {
          a = new Date();
          time = a.getHours() + ':' + a.getMinutes();
          document.getElementById('clock').innerHTML = time;
        }, 1000);

		const audio = new Audio("https://www.fesliyanstudios.com/play-mp3/387");
		const buttons = document.querySelectorAll("button");

		buttons.forEach(button => {
		button.addEventListener("click", () => {
			audio.play();
		});
		});

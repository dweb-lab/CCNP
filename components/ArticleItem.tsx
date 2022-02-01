import { memo } from "react"

interface ArticleItemProps {
  imageURL: string,
  name: string
  tags: string
  authors: string
  path: string
}

export const ArticleItem = memo<ArticleItemProps>(({ imageURL, tags, authors, name, path }) => {
  return (
    <div className="p-4 w-full md:w-1/3">
      <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
        <img className="lg:h-48 h-36 w-full object-cover object-center"
          src={imageURL}
          alt={name}/>
        <div className="p-4 md:p-6">
          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">{ tags }</h2>
          <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{ name }</h1>
          <p className="leading-relaxed mb-3">{ authors }</p>
          <div className="flex items-center flex-wrap ">
            <a className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0"
              href={"/article?cid=" + path}>Goto
              <svg className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
})

ArticleItem.displayName = 'ArticleItem'
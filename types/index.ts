export interface Article {
  authors: { name: string; wallet: { eth: string } }[]
  description: string
  image: string
  name: string
  tags: string[]
  filename: string
  filesize: number
  filetype: string
  url: string
  licenseURL: string
  license: string
}

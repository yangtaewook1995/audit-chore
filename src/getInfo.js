const fetch = require("node-fetch");
const API_KEY = "NYCHVCIXAFA2SYYP6K5CHU1RDD57Y4BEBN"; //API_KEY for etherscan
const baseAPI = {
    github_CommitHash: (owner, repo) =>
        `https://api.github.com/repos/${owner}/${repo}/git/refs/head`,
    github_FileList: (owner, repo) =>
        `https://api.github.com/search/code?q=+repo:${owner}/${repo}+filename:.sol`,
    etherscan: (address) =>
        `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${API_KEY}`,
};

const fetchData = (api) => fetch(api).then((res) => res.json());

const getUrlInfo = async (url) => {
    const output = { detail: {}, url };

    if (url.includes("github.com")) {
        const [, , , owner, repo] = url.split("/");
        output.type = "Github";
        output.detail["target_files"] = [];
        const api_CommitHash = baseAPI.github_CommitHash(owner, repo);
        const api_FileList = baseAPI.github_FileList(owner, repo);
        const data_CommitHash = await fetchData(api_CommitHash);
        const data_FileList = await fetchData(api_FileList);

        if (data_CommitHash.message) {
            throw new Error(data_CommitHash.message);
        }

        if (data_FileList.message) {
            throw new Error(data_FileList.message);
        }

        data_CommitHash.some(({ object, ref }) => {
            if (ref.includes("master") || ref.includes("main")) {
                output.detail["latest_commit_hash"] = object.sha;
                return true;
            }
        });

        data_FileList.items.forEach((file) => {
            output.detail["target_files"].push(file.name);
        });
    }

    else if (url.includes("etherscan.io")) {
        const [address] = url.match(/0x\w*/g);
        output.type = "Etherscan";
        output.detail.address = address;
        const api = baseAPI.etherscan(address);
        const { status, result } = await fetchData(api);
        
        if (+status) {
            output.detail.verified = true;
        } 
        
        else if (result.includes("not verified")) {
            output.detail.verified = false;
        } 
        
        else {
            throw new Error(result);
        }
    } 
    
    else if (url.includes("drive.google.com")) {
        output.type = "Google drive";
    } 
    
    else if (url.includes(".zip")) {
        output.type = "Others";
    } 
    
    else {
        output.type = "URL is not valid!";
    }

    return output;
};


const getUrlInfoWithString = async (url) => {
    const urlData = await getUrlInfo(url);
    const urlDetail = await urlData.detail;
    let result = "";

    if(urlData.type == "Github") {
        result = "Latest CommitHash : " + urlDetail.latest_commit_hash + "\nTarget File : " + urlDetail.target_files;
    }

    else if(urlData.type == "Etherscan") {
        result = "Address : " + urlDetail.address + "\nVerified : " + urlDetail.verified;
    }

    urlData.detail = result;
    return urlData;
}   

const githubExample = "https://github.com/HAECHI-LABS/audit-athlon";
const etherscanExample = "https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7";

getUrlInfo(githubExample).then(console.log);
getUrlInfoWithString(githubExample).then(console.log);

getUrlInfo(etherscanExample).then(console.log);
getUrlInfoWithString(etherscanExample).then(console.log);
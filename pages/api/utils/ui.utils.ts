
export  const formatSignatureCid = (cid: string) => {
    if (!cid) return 'N/A';
    return `${cid.slice(0, 10)}....${cid.slice(-8)}`;
  };
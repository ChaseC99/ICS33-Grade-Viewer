/* --- formula references point to MS-XLS --- */
/* Small helpers */
function parseread1(blob) { blob.l+=1; return; }

/* Rgce Helpers */

/* 2.5.51 */
function parse_ColRelU(blob, length) {
	var c = blob.read_shift(length == 1 ? 1 : 2);
	return [c & 0x3FFF, (c >> 14) & 1, (c >> 15) & 1];
}

/* [MS-XLS] 2.5.198.105 */
/* [MS-XLSB] 2.5.97.89 */
function parse_RgceArea(blob, length, opts) {
	var w = 2;
	if(opts) {
		if(opts.biff >= 2 && opts.biff <= 5) return parse_RgceArea_BIFF2(blob, length, opts);
		else if(opts.biff == 12) w = 4;
	}
	var r=blob.read_shift(w), R=blob.read_shift(w);
	var c=parse_ColRelU(blob, 2);
	var C=parse_ColRelU(blob, 2);
	return { s:{r:r, c:c[0], cRel:c[1], rRel:c[2]}, e:{r:R, c:C[0], cRel:C[1], rRel:C[2]} };
}
/* BIFF 2-5 encodes flags in the row field */
function parse_RgceArea_BIFF2(blob/*::, length, opts*/) {
	var r=parse_ColRelU(blob, 2), R=parse_ColRelU(blob, 2);
	var c=blob.read_shift(1);
	var C=blob.read_shift(1);
	return { s:{r:r[0], c:c, cRel:r[1], rRel:r[2]}, e:{r:R[0], c:C, cRel:R[1], rRel:R[2]} };
}

/* 2.5.198.105 TODO */
function parse_RgceAreaRel(blob, length/*::, opts*/) {
	var r=blob.read_shift(length == 12 ? 4 : 2), R=blob.read_shift(length == 12 ? 4 : 2);
	var c=parse_ColRelU(blob, 2);
	var C=parse_ColRelU(blob, 2);
	return { s:{r:r, c:c[0], cRel:c[1], rRel:c[2]}, e:{r:R, c:C[0], cRel:C[1], rRel:C[2]} };
}

/* 2.5.198.109 */
function parse_RgceLoc(blob, length, opts) {
	if(opts && opts.biff >= 2 && opts.biff <= 5) return parse_RgceLoc_BIFF2(blob, length, opts);
	var r = blob.read_shift(opts && opts.biff == 12 ? 4 : 2);
	var c = parse_ColRelU(blob, 2);
	return {r:r, c:c[0], cRel:c[1], rRel:c[2]};
}
function parse_RgceLoc_BIFF2(blob/*::, length, opts*/) {
	var r = parse_ColRelU(blob, 2);
	var c = blob.read_shift(1);
	return {r:r[0], c:c, cRel:r[1], rRel:r[2]};
}

/* 2.5.198.107 , 2.5.47 */
function parse_RgceElfLoc(blob/*::, length, opts*/) {
	var r = blob.read_shift(2);
	var c = blob.read_shift(2);
	return {r:r, c:c & 0xFF, fQuoted:!!(c & 0x4000), cRel:c>>15, rRel:c>>15 };
}

/* [MS-XLS] 2.5.198.111 TODO */
/* [MS-XLSB] 2.5.97.92 TODO */
function parse_RgceLocRel(blob, length, opts) {
	var biff = opts && opts.biff ? opts.biff : 8;
	if(biff >= 2 && biff <= 5) return parse_RgceLocRel_BIFF2(blob, length, opts);
	var r = blob.read_shift(biff >= 12 ? 4 : 2);
	var cl = blob.read_shift(2);
	var cRel = (cl & 0x4000) >> 14, rRel = (cl & 0x8000) >> 15;
	cl &= 0x3FFF;
	if(rRel == 1) while(r > 0x7FFFF) r -= 0x100000;
	if(cRel == 1) while(cl > 0x1FFF) cl = cl - 0x4000;
	return {r:r,c:cl,cRel:cRel,rRel:rRel};
}
function parse_RgceLocRel_BIFF2(blob/*::, length:number, opts*/) {
	var rl = blob.read_shift(2);
	var c = blob.read_shift(1);
	var rRel = (rl & 0x8000) >> 15, cRel = (rl & 0x4000) >> 14;
	rl &= 0x3FFF;
	if(rRel == 1 && rl >= 0x2000) rl = rl - 0x4000;
	if(cRel == 1 && c >= 0x80) c = c - 0x100;
	return {r:rl,c:c,cRel:cRel,rRel:rRel};
}

/* Ptg Tokens */

/* 2.5.198.27 */
function parse_PtgArea(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	var area = parse_RgceArea(blob, opts.biff >= 2 && opts.biff <= 5 ? 6 : 8, opts);
	return [type, area];
}

/* [MS-XLS] 2.5.198.28 */
/* [MS-XLSB] 2.5.97.19 */
function parse_PtgArea3d(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	var ixti = blob.read_shift(2, 'i');
	var w = 8;
	if(opts) switch(opts.biff) {
		case 5: blob.l += 12; w = 6; break;
		case 12: w = 12; break;
	}
	var area = parse_RgceArea(blob, w, opts);
	return [type, ixti, area];
}

/* 2.5.198.29 */
function parse_PtgAreaErr(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	blob.l += opts && opts.biff > 8 ? 12 : 8;
	return [type];
}
/* 2.5.198.30 */
function parse_PtgAreaErr3d(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	var ixti = blob.read_shift(2);
	var w = 8;
	if(opts) switch(opts.biff) {
		case 5: blob.l += 12; w = 6; break;
		case 12: w = 12; break;
	}
	blob.l += w;
	return [type, ixti];
}

/* 2.5.198.31 */
function parse_PtgAreaN(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	var area = parse_RgceAreaRel(blob, opts && opts.biff > 8 ? 12 : 8, opts);
	return [type, area];
}

/* [MS-XLS] 2.5.198.32 */
/* [MS-XLSB] 2.5.97.23 */
function parse_PtgArray(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	blob.l += opts.biff == 2 ? 6 : opts.biff == 12 ? 14 : 7;
	return [type];
}

/* 2.5.198.33 */
function parse_PtgAttrBaxcel(blob) {
	var bitSemi = blob[blob.l+1] & 0x01; /* 1 = volatile */
	var bitBaxcel = 1;
	blob.l += 4;
	return [bitSemi, bitBaxcel];
}

/* 2.5.198.34 */
function parse_PtgAttrChoose(blob, length, opts)/*:Array<number>*/ {
	blob.l +=2;
	var offset = blob.read_shift(opts && opts.biff == 2 ? 1 : 2);
	var o/*:Array<number>*/ = [];
	/* offset is 1 less than the number of elements */
	for(var i = 0; i <= offset; ++i) o.push(blob.read_shift(opts && opts.biff == 2 ? 1 : 2));
	return o;
}

/* 2.5.198.35 */
function parse_PtgAttrGoto(blob, length, opts) {
	var bitGoto = (blob[blob.l+1] & 0xFF) ? 1 : 0;
	blob.l += 2;
	return [bitGoto, blob.read_shift(opts && opts.biff == 2 ? 1 : 2)];
}

/* 2.5.198.36 */
function parse_PtgAttrIf(blob, length, opts) {
	var bitIf = (blob[blob.l+1] & 0xFF) ? 1 : 0;
	blob.l += 2;
	return [bitIf, blob.read_shift(opts && opts.biff == 2 ? 1 : 2)];
}

/* [MS-XLSB] 2.5.97.28 */
function parse_PtgAttrIfError(blob) {
	var bitIf = (blob[blob.l+1] & 0xFF) ? 1 : 0;
	blob.l += 2;
	return [bitIf, blob.read_shift(2)];
}

/* 2.5.198.37 */
function parse_PtgAttrSemi(blob, length, opts) {
	var bitSemi = (blob[blob.l+1] & 0xFF) ? 1 : 0;
	blob.l += opts && opts.biff == 2 ? 3 : 4;
	return [bitSemi];
}

/* 2.5.198.40 (used by PtgAttrSpace and PtgAttrSpaceSemi) */
function parse_PtgAttrSpaceType(blob/*::, length*/) {
	var type = blob.read_shift(1), cch = blob.read_shift(1);
	return [type, cch];
}

/* 2.5.198.38 */
function parse_PtgAttrSpace(blob) {
	blob.read_shift(2);
	return parse_PtgAttrSpaceType(blob, 2);
}

/* 2.5.198.39 */
function parse_PtgAttrSpaceSemi(blob) {
	blob.read_shift(2);
	return parse_PtgAttrSpaceType(blob, 2);
}

/* 2.5.198.84 TODO */
function parse_PtgRef(blob, length, opts) {
	//var ptg = blob[blob.l] & 0x1F;
	var type = (blob[blob.l] & 0x60)>>5;
	blob.l += 1;
	var loc = parse_RgceLoc(blob, 0, opts);
	return [type, loc];
}

/* 2.5.198.88 TODO */
function parse_PtgRefN(blob, length, opts) {
	var type = (blob[blob.l] & 0x60)>>5;
	blob.l += 1;
	var loc = parse_RgceLocRel(blob, 0, opts);
	return [type, loc];
}

/* 2.5.198.85 TODO */
function parse_PtgRef3d(blob, length, opts) {
	var type = (blob[blob.l] & 0x60)>>5;
	blob.l += 1;
	var ixti = blob.read_shift(2); // XtiIndex
	var loc = parse_RgceLoc(blob, 0, opts); // TODO: or RgceLocRel
	return [type, ixti, loc];
}


/* 2.5.198.62 TODO */
function parse_PtgFunc(blob, length, opts) {
	//var ptg = blob[blob.l] & 0x1F;
	var type = (blob[blob.l] & 0x60)>>5;
	blob.l += 1;
	var iftab = blob.read_shift(opts && opts.biff <= 3 ? 1 : 2);
	return [FtabArgc[iftab], Ftab[iftab], type];
}
/* 2.5.198.63 TODO */
function parse_PtgFuncVar(blob, length, opts) {
	blob.l++;
	var cparams = blob.read_shift(1), tab = opts && opts.biff <= 3 ? [0, blob.read_shift(1)]: parsetab(blob);
	return [cparams, (tab[0] === 0 ? Ftab : Cetab)[tab[1]]];
}

function parsetab(blob) {
	return [blob[blob.l+1]>>7, blob.read_shift(2) & 0x7FFF];
}

/* 2.5.198.41 */
function parse_PtgAttrSum(blob, length, opts) {
	blob.l += opts && opts.biff == 2 ? 3 : 4; return;
}

/* 2.5.198.58 */
function parse_PtgExp(blob, length, opts) {
	blob.l++;
	if(opts && opts.biff == 12) return [blob.read_shift(4, 'i'), 0];
	var row = blob.read_shift(2);
	var col = blob.read_shift(opts && opts.biff == 2 ? 1 : 2);
	return [row, col];
}

/* 2.5.198.57 */
function parse_PtgErr(blob) { blob.l++; return BErr[blob.read_shift(1)]; }

/* 2.5.198.66 */
function parse_PtgInt(blob) { blob.l++; return blob.read_shift(2); }

/* 2.5.198.42 */
function parse_PtgBool(blob) { blob.l++; return blob.read_shift(1)!==0;}

/* 2.5.198.79 */
function parse_PtgNum(blob) { blob.l++; return parse_Xnum(blob, 8); }

/* 2.5.198.89 */
function parse_PtgStr(blob, length, opts) { blob.l++; return parse_ShortXLUnicodeString(blob, length-1, opts); }

/* [MS-XLS] 2.5.192.112 + 2.5.192.11{3,4,5,6,7} */
/* [MS-XLSB] 2.5.97.93 + 2.5.97.9{4,5,6,7} */
function parse_SerAr(blob, biff/*:number*/) {
	var val = [blob.read_shift(1)];
	if(biff == 12) switch(val[0]) {
		case 0x02: val[0] = 0x04; break; /* SerBool */
		case 0x04: val[0] = 0x10; break; /* SerErr */
		case 0x00: val[0] = 0x01; break; /* SerNum */
		case 0x01: val[0] = 0x02; break; /* SerStr */
	}
	switch(val[0]) {
		/* 2.5.192.113 */
		case 0x04: /* SerBool -- boolean */
			val[1] = parsebool(blob, 1) ? 'TRUE' : 'FALSE';
			blob.l += 7; break;
		/* 2.5.192.114 */
		case 0x10: /* SerErr -- error */
			val[1] = BErr[blob[blob.l]];
			blob.l += 8; break;
		/* 2.5.192.115 */
		case 0x00: /* SerNil -- honestly, I'm not sure how to reproduce this */
			blob.l += 8; break;
		/* 2.5.192.116 */
		case 0x01: /* SerNum -- Xnum */
			val[1] = parse_Xnum(blob, 8); break;
		/* 2.5.192.117 */
		case 0x02: /* SerStr -- XLUnicodeString (<256 chars) */
			val[1] = parse_XLUnicodeString2(blob, 0, {biff:biff > 0 && biff < 8 ? 2 : biff}); break;
		// default: throw "Bad SerAr: " + val[0]; /* Unreachable */
	}
	return val;
}

/* 2.5.198.61 */
function parse_PtgExtraMem(blob/*::, cce*/) {
	var count = blob.read_shift(2);
	var out/*:Array<Range>*/ = [];
	for(var i = 0; i != count; ++i) out.push(parse_Ref8U(blob, 8));
	return out;
}

/* 2.5.198.59 */
function parse_PtgExtraArray(blob, length, opts) {
	var rows = 0, cols = 0;
	if(opts.biff == 12) {
		rows = blob.read_shift(4); // DRw
		cols = blob.read_shift(4); // DCol
	} else {
		cols = 1 + blob.read_shift(1); //DColByteU
		rows = 1 + blob.read_shift(2); //DRw
	}
	if(opts.biff >= 2 && opts.biff < 8) { --rows; if(--cols == 0) cols = 0x100; }
	// $FlowIgnore
	for(var i = 0, o/*:Array<Array<any>>*/ = []; i != rows && (o[i] = []); ++i)
		for(var j = 0; j != cols; ++j) o[i][j] = parse_SerAr(blob, opts.biff);
	return o;
}

/* 2.5.198.76 */
function parse_PtgName(blob, length, opts) {
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	var w = (!opts || (opts.biff >= 8)) ? 4 : 2;
	var nameindex = blob.read_shift(w);
	switch(opts.biff) {
		case 2: blob.l += 5; break;
		case 3: case 4: blob.l += 8; break;
		case 5: blob.l += 12; break;
	}
	return [type, 0, nameindex];
}

/* 2.5.198.77 */
function parse_PtgNameX(blob, length, opts) {
	if(opts.biff == 5) return parse_PtgNameX_BIFF5(blob, length, opts);
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	var ixti = blob.read_shift(2); // XtiIndex
	var nameindex = blob.read_shift(4);
	return [type, ixti, nameindex];
}
function parse_PtgNameX_BIFF5(blob/*::, length, opts*/) {
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	var ixti = blob.read_shift(2, 'i'); // XtiIndex
	blob.l += 8;
	var nameindex = blob.read_shift(2);
	blob.l += 12;
	return [type, ixti, nameindex];
}

/* 2.5.198.70 */
function parse_PtgMemArea(blob, length, opts) {
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	blob.l += (opts && opts.biff == 2 ? 3 : 4);
	var cce = blob.read_shift(opts && opts.biff == 2 ? 1 : 2);
	return [type, cce];
}

/* 2.5.198.72 */
function parse_PtgMemFunc(blob, length, opts) {
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	var cce = blob.read_shift(opts && opts.biff == 2 ? 1 : 2);
	return [type, cce];
}


/* 2.5.198.86 */
function parse_PtgRefErr(blob, length, opts) {
	var type = (blob.read_shift(1) >>> 5) & 0x03;
	blob.l += 4;
	if(opts.biff == 12) blob.l += 2;
	return [type];
}

/* 2.5.198.87 */
function parse_PtgRefErr3d(blob, length, opts) {
	var type = (blob[blob.l++] & 0x60) >> 5;
	var ixti = blob.read_shift(2);
	var w = 4;
	if(opts) switch(opts.biff) {
		case 5: throw new Error("PtgRefErr3d -- 5"); // TODO: find test case
		case 12: w = 6; break;
	}
	blob.l += w;
	return [type, ixti];
}

/* 2.5.198.71 */
var parse_PtgMemErr = parsenoop;
/* 2.5.198.73 */
var parse_PtgMemNoMem = parsenoop;
/* 2.5.198.92 */
var parse_PtgTbl = parsenoop;

function parse_PtgElfLoc(blob, length, opts) {
	blob.l += 2;
	return [parse_RgceElfLoc(blob, 4, opts)];
}
function parse_PtgElfNoop(blob/*::, length, opts*/) {
	blob.l += 6;
	return [];
}
/* 2.5.198.46 */
var parse_PtgElfCol = parse_PtgElfLoc;
/* 2.5.198.47 */
var parse_PtgElfColS = parse_PtgElfNoop;
/* 2.5.198.48 */
var parse_PtgElfColSV = parse_PtgElfNoop;
/* 2.5.198.49 */
var parse_PtgElfColV = parse_PtgElfLoc;
/* 2.5.198.50 */
function parse_PtgElfLel(blob/*::, length, opts*/) {
	blob.l += 2;
	return [parseuint16(blob), blob.read_shift(2) & 0x01];
}
/* 2.5.198.51 */
var parse_PtgElfRadical = parse_PtgElfLoc;
/* 2.5.198.52 */
var parse_PtgElfRadicalLel = parse_PtgElfLel;
/* 2.5.198.53 */
var parse_PtgElfRadicalS = parse_PtgElfNoop;
/* 2.5.198.54 */
var parse_PtgElfRw = parse_PtgElfLoc;
/* 2.5.198.55 */
var parse_PtgElfRwV = parse_PtgElfLoc;

/* [MS-XLSB] 2.5.97.52 */
function parse_PtgList(blob/*::, length, opts*/) {
	blob.l += 2;
	var ixti = blob.read_shift(2);
	blob.l += 10;
	return {ixti: ixti};
}
/* 2.5.198.91 */
function parse_PtgSxName(blob/*::, length, opts*/) {
	blob.l += 2;
	return [blob.read_shift(4)];
}

/* 2.5.198.25 */
var PtgTypes = {
	/*::[*/0x01/*::]*/: { n:'PtgExp', f:parse_PtgExp },
	/*::[*/0x02/*::]*/: { n:'PtgTbl', f:parse_PtgTbl },
	/*::[*/0x03/*::]*/: { n:'PtgAdd', f:parseread1 },
	/*::[*/0x04/*::]*/: { n:'PtgSub', f:parseread1 },
	/*::[*/0x05/*::]*/: { n:'PtgMul', f:parseread1 },
	/*::[*/0x06/*::]*/: { n:'PtgDiv', f:parseread1 },
	/*::[*/0x07/*::]*/: { n:'PtgPower', f:parseread1 },
	/*::[*/0x08/*::]*/: { n:'PtgConcat', f:parseread1 },
	/*::[*/0x09/*::]*/: { n:'PtgLt', f:parseread1 },
	/*::[*/0x0A/*::]*/: { n:'PtgLe', f:parseread1 },
	/*::[*/0x0B/*::]*/: { n:'PtgEq', f:parseread1 },
	/*::[*/0x0C/*::]*/: { n:'PtgGe', f:parseread1 },
	/*::[*/0x0D/*::]*/: { n:'PtgGt', f:parseread1 },
	/*::[*/0x0E/*::]*/: { n:'PtgNe', f:parseread1 },
	/*::[*/0x0F/*::]*/: { n:'PtgIsect', f:parseread1 },
	/*::[*/0x10/*::]*/: { n:'PtgUnion', f:parseread1 },
	/*::[*/0x11/*::]*/: { n:'PtgRange', f:parseread1 },
	/*::[*/0x12/*::]*/: { n:'PtgUplus', f:parseread1 },
	/*::[*/0x13/*::]*/: { n:'PtgUminus', f:parseread1 },
	/*::[*/0x14/*::]*/: { n:'PtgPercent', f:parseread1 },
	/*::[*/0x15/*::]*/: { n:'PtgParen', f:parseread1 },
	/*::[*/0x16/*::]*/: { n:'PtgMissArg', f:parseread1 },
	/*::[*/0x17/*::]*/: { n:'PtgStr', f:parse_PtgStr },
	/*::[*/0x1C/*::]*/: { n:'PtgErr', f:parse_PtgErr },
	/*::[*/0x1D/*::]*/: { n:'PtgBool', f:parse_PtgBool },
	/*::[*/0x1E/*::]*/: { n:'PtgInt', f:parse_PtgInt },
	/*::[*/0x1F/*::]*/: { n:'PtgNum', f:parse_PtgNum },
	/*::[*/0x20/*::]*/: { n:'PtgArray', f:parse_PtgArray },
	/*::[*/0x21/*::]*/: { n:'PtgFunc', f:parse_PtgFunc },
	/*::[*/0x22/*::]*/: { n:'PtgFuncVar', f:parse_PtgFuncVar },
	/*::[*/0x23/*::]*/: { n:'PtgName', f:parse_PtgName },
	/*::[*/0x24/*::]*/: { n:'PtgRef', f:parse_PtgRef },
	/*::[*/0x25/*::]*/: { n:'PtgArea', f:parse_PtgArea },
	/*::[*/0x26/*::]*/: { n:'PtgMemArea', f:parse_PtgMemArea },
	/*::[*/0x27/*::]*/: { n:'PtgMemErr', f:parse_PtgMemErr },
	/*::[*/0x28/*::]*/: { n:'PtgMemNoMem', f:parse_PtgMemNoMem },
	/*::[*/0x29/*::]*/: { n:'PtgMemFunc', f:parse_PtgMemFunc },
	/*::[*/0x2A/*::]*/: { n:'PtgRefErr', f:parse_PtgRefErr },
	/*::[*/0x2B/*::]*/: { n:'PtgAreaErr', f:parse_PtgAreaErr },
	/*::[*/0x2C/*::]*/: { n:'PtgRefN', f:parse_PtgRefN },
	/*::[*/0x2D/*::]*/: { n:'PtgAreaN', f:parse_PtgAreaN },
	/*::[*/0x39/*::]*/: { n:'PtgNameX', f:parse_PtgNameX },
	/*::[*/0x3A/*::]*/: { n:'PtgRef3d', f:parse_PtgRef3d },
	/*::[*/0x3B/*::]*/: { n:'PtgArea3d', f:parse_PtgArea3d },
	/*::[*/0x3C/*::]*/: { n:'PtgRefErr3d', f:parse_PtgRefErr3d },
	/*::[*/0x3D/*::]*/: { n:'PtgAreaErr3d', f:parse_PtgAreaErr3d },
	/*::[*/0xFF/*::]*/: {}
};
/* These are duplicated in the PtgTypes table */
var PtgDupes = {
	/*::[*/0x40/*::]*/: 0x20, /*::[*/0x60/*::]*/: 0x20,
	/*::[*/0x41/*::]*/: 0x21, /*::[*/0x61/*::]*/: 0x21,
	/*::[*/0x42/*::]*/: 0x22, /*::[*/0x62/*::]*/: 0x22,
	/*::[*/0x43/*::]*/: 0x23, /*::[*/0x63/*::]*/: 0x23,
	/*::[*/0x44/*::]*/: 0x24, /*::[*/0x64/*::]*/: 0x24,
	/*::[*/0x45/*::]*/: 0x25, /*::[*/0x65/*::]*/: 0x25,
	/*::[*/0x46/*::]*/: 0x26, /*::[*/0x66/*::]*/: 0x26,
	/*::[*/0x47/*::]*/: 0x27, /*::[*/0x67/*::]*/: 0x27,
	/*::[*/0x48/*::]*/: 0x28, /*::[*/0x68/*::]*/: 0x28,
	/*::[*/0x49/*::]*/: 0x29, /*::[*/0x69/*::]*/: 0x29,
	/*::[*/0x4A/*::]*/: 0x2A, /*::[*/0x6A/*::]*/: 0x2A,
	/*::[*/0x4B/*::]*/: 0x2B, /*::[*/0x6B/*::]*/: 0x2B,
	/*::[*/0x4C/*::]*/: 0x2C, /*::[*/0x6C/*::]*/: 0x2C,
	/*::[*/0x4D/*::]*/: 0x2D, /*::[*/0x6D/*::]*/: 0x2D,
	/*::[*/0x59/*::]*/: 0x39, /*::[*/0x79/*::]*/: 0x39,
	/*::[*/0x5A/*::]*/: 0x3A, /*::[*/0x7A/*::]*/: 0x3A,
	/*::[*/0x5B/*::]*/: 0x3B, /*::[*/0x7B/*::]*/: 0x3B,
	/*::[*/0x5C/*::]*/: 0x3C, /*::[*/0x7C/*::]*/: 0x3C,
	/*::[*/0x5D/*::]*/: 0x3D, /*::[*/0x7D/*::]*/: 0x3D
};
(function(){for(var y in PtgDupes) PtgTypes[y] = PtgTypes[PtgDupes[y]];})();

var Ptg18 = {
	/*::[*/0x01/*::]*/: { n:'PtgElfLel', f:parse_PtgElfLel },
	/*::[*/0x02/*::]*/: { n:'PtgElfRw', f:parse_PtgElfRw },
	/*::[*/0x03/*::]*/: { n:'PtgElfCol', f:parse_PtgElfCol },
	/*::[*/0x06/*::]*/: { n:'PtgElfRwV', f:parse_PtgElfRwV },
	/*::[*/0x07/*::]*/: { n:'PtgElfColV', f:parse_PtgElfColV },
	/*::[*/0x0A/*::]*/: { n:'PtgElfRadical', f:parse_PtgElfRadical },
	/*::[*/0x0B/*::]*/: { n:'PtgElfRadicalS', f:parse_PtgElfRadicalS },
	/*::[*/0x0D/*::]*/: { n:'PtgElfColS', f:parse_PtgElfColS },
	/*::[*/0x0F/*::]*/: { n:'PtgElfColSV', f:parse_PtgElfColSV },
	/*::[*/0x10/*::]*/: { n:'PtgElfRadicalLel', f:parse_PtgElfRadicalLel },
	/*::[*/0x19/*::]*/: { n:'PtgList', f:parse_PtgList },
	/*::[*/0x1D/*::]*/: { n:'PtgSxName', f:parse_PtgSxName },
	/*::[*/0xFF/*::]*/: {}
};
var Ptg19 = {
	/*::[*/0x01/*::]*/: { n:'PtgAttrSemi', f:parse_PtgAttrSemi },
	/*::[*/0x02/*::]*/: { n:'PtgAttrIf', f:parse_PtgAttrIf },
	/*::[*/0x04/*::]*/: { n:'PtgAttrChoose', f:parse_PtgAttrChoose },
	/*::[*/0x08/*::]*/: { n:'PtgAttrGoto', f:parse_PtgAttrGoto },
	/*::[*/0x10/*::]*/: { n:'PtgAttrSum', f:parse_PtgAttrSum },
	/*::[*/0x20/*::]*/: { n:'PtgAttrBaxcel', f:parse_PtgAttrBaxcel },
	/*::[*/0x40/*::]*/: { n:'PtgAttrSpace', f:parse_PtgAttrSpace },
	/*::[*/0x41/*::]*/: { n:'PtgAttrSpaceSemi', f:parse_PtgAttrSpaceSemi },
	/*::[*/0x80/*::]*/: { n:'PtgAttrIfError', f:parse_PtgAttrIfError },
	/*::[*/0xFF/*::]*/: {}
};
Ptg19[0x21] = Ptg19[0x20];

/* 2.5.198.103 */
function parse_RgbExtra(blob, length, rgce, opts) {
	if(opts.biff < 8) return parsenoop(blob, length);
	var target = blob.l + length;
	var o = [];
	for(var i = 0; i !== rgce.length; ++i) {
		switch(rgce[i][0]) {
			case 'PtgArray': /* PtgArray -> PtgExtraArray */
				rgce[i][1] = parse_PtgExtraArray(blob, 0, opts);
				o.push(rgce[i][1]);
				break;
			case 'PtgMemArea': /* PtgMemArea -> PtgExtraMem */
				rgce[i][2] = parse_PtgExtraMem(blob, rgce[i][1]);
				o.push(rgce[i][2]);
				break;
			case 'PtgExp': /* PtgExp -> PtgExtraCol */
				if(opts && opts.biff == 12) {
					rgce[i][1][1] = blob.read_shift(4);
					o.push(rgce[i][1]);
				} break;
			case 'PtgList': /* TODO: PtgList -> PtgExtraList */
			case 'PtgElfRadicalS': /* TODO: PtgElfRadicalS -> PtgExtraElf */
			case 'PtgElfColS': /* TODO: PtgElfColS -> PtgExtraElf */
			case 'PtgElfColSV': /* TODO: PtgElfColSV -> PtgExtraElf */
				throw "Unsupported " + rgce[i][0];
			default: break;
		}
	}
	length = target - blob.l;
	/* note: this is technically an error but Excel disregards */
	//if(target !== blob.l && blob.l !== target - length) throw new Error(target + " != " + blob.l);
	if(length !== 0) o.push(parsenoop(blob, length));
	return o;
}

/* 2.5.198.104 */
function parse_Rgce(blob, length, opts) {
	var target = blob.l + length;
	var R, id, ptgs = [];
	while(target != blob.l) {
		length = target - blob.l;
		id = blob[blob.l];
		R = PtgTypes[id];
		if(id === 0x18 || id === 0x19) {
			id = blob[blob.l + 1];
			R = (id === 0x18 ? Ptg18 : Ptg19)[id];
		}
		if(!R || !R.f) { /*ptgs.push*/(parsenoop(blob, length)); }
		// $FlowIgnore
		else { ptgs.push([R.n, R.f(blob, length, opts)]); }
	}
	return ptgs;
}

function stringify_array(f/*:Array<Array<string>>*/)/*:string*/ {
	var o/*:Array<string>*/ = [];
	for(var i = 0; i < f.length; ++i) {
		var x = f[i], r/*:Array<string>*/ = [];
		for(var j = 0; j < x.length; ++j) {
			var y = x[j];
			if(y) switch(y[0]) {
				// TODO: handle embedded quotes
				case 0x02:
					/*:: if(typeof y[1] != 'string') throw "unreachable"; */
					r.push('"' + y[1].replace(/"/g,'""') + '"'); break;
				default: r.push(y[1]);
			} else r.push("");
		}
		o.push(r.join(","));
	}
	return o.join(";");
}

/* [MS-XLS] 2.2.2 TODO */
/* [MS-XLSB] 2.2.2 */
var PtgBinOp = {
	PtgAdd: "+",
	PtgConcat: "&",
	PtgDiv: "/",
	PtgEq: "=",
	PtgGe: ">=",
	PtgGt: ">",
	PtgLe: "<=",
	PtgLt: "<",
	PtgMul: "*",
	PtgNe: "<>",
	PtgPower: "^",
	PtgSub: "-"
};
function formula_quote_sheet_name(sname/*:string*/, opts)/*:string*/ {
	if(!sname && !(opts && opts.biff <= 5 && opts.biff >= 2)) throw new Error("empty sheet name");
	if(sname.indexOf(" ") > -1) return "'" + sname + "'";
	return sname;
}
function get_ixti_raw(supbooks, ixti/*:number*/, opts)/*:string*/ {
	if(!supbooks) return "SH33TJSERR0";
	if(!supbooks.XTI) return "SH33TJSERR6";
	var XTI = supbooks.XTI[ixti];
	if(opts.biff > 8 && !supbooks.XTI[ixti]) return supbooks.SheetNames[ixti];
	if(opts.biff < 8) {
		if(ixti > 10000) ixti-= 65536;
		if(ixti < 0) ixti = -ixti;
		return ixti == 0 ? "" : supbooks.XTI[ixti - 1];
	}
	if(!XTI) return "SH33TJSERR1";
	var o = "";
	if(opts.biff > 8) switch(supbooks[XTI[0]][0]) {
		case 0x0165: /* 'BrtSupSelf' */
			o = XTI[1] == -1 ? "#REF" : supbooks.SheetNames[XTI[1]];
			return XTI[1] == XTI[2] ? o : o + ":" + supbooks.SheetNames[XTI[2]];
		case 0x0166: /* 'BrtSupSame' */
			if(opts.SID != null) return supbooks.SheetNames[opts.SID];
			return "SH33TJSSAME" + supbooks[XTI[0]][0];
		case 0x0163: /* 'BrtSupBookSrc' */
			/* falls through */
		default: return "SH33TJSSRC" + supbooks[XTI[0]][0];
	}
	switch(supbooks[XTI[0]][0][0]) {
		case 0x0401:
			o = XTI[1] == -1 ? "#REF" : (supbooks.SheetNames[XTI[1]] || "SH33TJSERR3");
			return XTI[1] == XTI[2] ? o : o + ":" + supbooks.SheetNames[XTI[2]];
		case 0x3A01: return "SH33TJSERR8";
		default:
			if(!supbooks[XTI[0]][0][3]) return "SH33TJSERR2";
			o = XTI[1] == -1 ? "#REF" : (supbooks[XTI[0]][0][3][XTI[1]] || "SH33TJSERR4");
			return XTI[1] == XTI[2] ? o : o + ":" + supbooks[XTI[0]][0][3][XTI[2]];
	}
}
function get_ixti(supbooks, ixti/*:number*/, opts)/*:string*/ {
	return formula_quote_sheet_name(get_ixti_raw(supbooks, ixti, opts), opts);
}
function stringify_formula(formula/*Array<any>*/, range, cell/*:any*/, supbooks, opts)/*:string*/ {
	var _range = /*range != null ? range :*/ {s:{c:0, r:0},e:{c:0, r:0}};
	var stack/*:Array<string>*/ = [], e1, e2, /*::type,*/ c/*:CellAddress*/, ixti=0, nameidx=0, r, sname="";
	if(!formula[0] || !formula[0][0]) return "";
	var last_sp = -1, sp = "";
	for(var ff = 0, fflen = formula[0].length; ff < fflen; ++ff) {
		var f = formula[0][ff];
		switch(f[0]) {
			case 'PtgUminus': /* 2.5.198.93 */
				stack.push("-" + stack.pop()); break;
			case 'PtgUplus': /* 2.5.198.95 */
				stack.push("+" + stack.pop()); break;
			case 'PtgPercent': /* 2.5.198.81 */
				stack.push(stack.pop() + "%"); break;

			case 'PtgAdd':    /* 2.5.198.26 */
			case 'PtgConcat': /* 2.5.198.43 */
			case 'PtgDiv':    /* 2.5.198.45 */
			case 'PtgEq':     /* 2.5.198.56 */
			case 'PtgGe':     /* 2.5.198.64 */
			case 'PtgGt':     /* 2.5.198.65 */
			case 'PtgLe':     /* 2.5.198.68 */
			case 'PtgLt':     /* 2.5.198.69 */
			case 'PtgMul':    /* 2.5.198.75 */
			case 'PtgNe':     /* 2.5.198.78 */
			case 'PtgPower':  /* 2.5.198.82 */
			case 'PtgSub':    /* 2.5.198.90 */
				e1 = stack.pop(); e2 = stack.pop();
				if(last_sp >= 0) {
					switch(formula[0][last_sp][1][0]) {
						case 0:
							// $FlowIgnore
							sp = fill(" ", formula[0][last_sp][1][1]); break;
						case 1:
							// $FlowIgnore
							sp = fill("\r", formula[0][last_sp][1][1]); break;
						default:
							sp = "";
							// $FlowIgnore
							if(opts.WTF) throw new Error("Unexpected PtgAttrSpaceType " + formula[0][last_sp][1][0]);
					}
					e2 = e2 + sp;
					last_sp = -1;
				}
				stack.push(e2+PtgBinOp[f[0]]+e1);
				break;

			case 'PtgIsect': /* 2.5.198.67 */
				e1 = stack.pop(); e2 = stack.pop();
				stack.push(e2+" "+e1);
				break;
			case 'PtgUnion': /* 2.5.198.94 */
				e1 = stack.pop(); e2 = stack.pop();
				stack.push(e2+","+e1);
				break;
			case 'PtgRange': /* 2.5.198.83 */
				e1 = stack.pop(); e2 = stack.pop();
				stack.push(e2+":"+e1);
				break;

			case 'PtgAttrChoose': /* 2.5.198.34 */
				break;
			case 'PtgAttrGoto': /* 2.5.198.35 */
				break;
			case 'PtgAttrIf': /* 2.5.198.36 */
				break;
			case 'PtgAttrIfError': /* [MS-XLSB] 2.5.97.28 */
				break;


			case 'PtgRef': /* 2.5.198.84 */
				/*::type = f[1][0]; */c = shift_cell_xls((f[1][1]/*:any*/), _range, opts);
				stack.push(encode_cell_xls(c));
				break;
			case 'PtgRefN': /* 2.5.198.88 */
				/*::type = f[1][0]; */c = cell ? shift_cell_xls((f[1][1]/*:any*/), cell, opts) : (f[1][1]/*:any*/);
				stack.push(encode_cell_xls(c));
				break;
			case 'PtgRef3d': /* 2.5.198.85 */
				/*::type = f[1][0]; */ixti = /*::Number(*/f[1][1]/*::)*/; c = shift_cell_xls((f[1][2]/*:any*/), _range, opts);
				sname = get_ixti(supbooks, ixti, opts);
				var w = sname; /* IE9 fails on defined names */ // eslint-disable-line no-unused-vars
				stack.push(sname + "!" + encode_cell_xls(c));
				break;

			case 'PtgFunc': /* 2.5.198.62 */
			case 'PtgFuncVar': /* 2.5.198.63 */
				/* f[1] = [argc, func, type] */
				var argc/*:number*/ = (f[1][0]/*:any*/), func/*:string*/ = (f[1][1]/*:any*/);
				if(!argc) argc = 0;
				var args = argc == 0 ? [] : stack.slice(-argc);
				stack.length -= argc;
				if(func === 'User') func = args.shift();
				stack.push(func + "(" + args.join(",") + ")");
				break;

			case 'PtgBool': /* 2.5.198.42 */
				stack.push(f[1] ? "TRUE" : "FALSE"); break;
			case 'PtgInt': /* 2.5.198.66 */
				stack.push(/*::String(*/f[1]/*::)*/); break;
			case 'PtgNum': /* 2.5.198.79 TODO: precision? */
				stack.push(String(f[1])); break;
			case 'PtgStr': /* 2.5.198.89 */
				// $FlowIgnore
				stack.push('"' + f[1] + '"'); break;
			case 'PtgErr': /* 2.5.198.57 */
				stack.push(/*::String(*/f[1]/*::)*/); break;
			case 'PtgAreaN': /* 2.5.198.31 TODO */
				/*::type = f[1][0]; */r = shift_range_xls(f[1][1], cell ? {s:cell} : _range, opts);
				stack.push(encode_range_xls((r/*:any*/), opts));
				break;
			case 'PtgArea': /* 2.5.198.27 TODO: fixed points */
				/*::type = f[1][0]; */r = shift_range_xls(f[1][1], _range, opts);
				stack.push(encode_range_xls((r/*:any*/), opts));
				break;
			case 'PtgArea3d': /* 2.5.198.28 TODO */
				/*::type = f[1][0]; */ixti = /*::Number(*/f[1][1]/*::)*/; r = f[1][2];
				sname = get_ixti(supbooks, ixti, opts);
				stack.push(sname + "!" + encode_range_xls((r/*:any*/), opts));
				break;
			case 'PtgAttrSum': /* 2.5.198.41 */
				stack.push("SUM(" + stack.pop() + ")");
				break;

			case 'PtgAttrSemi': /* 2.5.198.37 */
				break;

			case 'PtgName': /* 2.5.97.60 TODO: revisions */
				/* f[1] = type, 0, nameindex */
				nameidx = (f[1][2]/*:any*/);
				var lbl = (supbooks.names||[])[nameidx-1] || (supbooks[0]||[])[nameidx];
				var name = lbl ? lbl.Name : "SH33TJSNAME" + String(nameidx);
				if(name in XLSXFutureFunctions) name = XLSXFutureFunctions[name];
				stack.push(name);
				break;

			case 'PtgNameX': /* 2.5.97.61 TODO: revisions */
				/* f[1] = type, ixti, nameindex */
				var bookidx/*:number*/ = (f[1][1]/*:any*/); nameidx = (f[1][2]/*:any*/); var externbook;
				/* TODO: Properly handle missing values */
				if(opts.biff <= 5) {
					if(bookidx < 0) bookidx = -bookidx;
					if(supbooks[bookidx]) externbook = supbooks[bookidx][nameidx];
				} else {
					var o = "";
					if(((supbooks[bookidx]||[])[0]||[])[0] == 0x3A01){/* empty */}
					else if(((supbooks[bookidx]||[])[0]||[])[0] == 0x0401){
						if(supbooks[bookidx][nameidx] && supbooks[bookidx][nameidx].itab > 0) {
							o = supbooks.SheetNames[supbooks[bookidx][nameidx].itab-1] + "!";
						}
					}
					else o = supbooks.SheetNames[nameidx-1]+ "!";
					if(supbooks[bookidx] && supbooks[bookidx][nameidx]) o += supbooks[bookidx][nameidx].Name;
					else if(supbooks[0] && supbooks[0][nameidx]) o += supbooks[0][nameidx].Name;
					else o += "SH33TJSERRX";
					stack.push(o);
					break;
				}
				if(!externbook) externbook = {Name: "SH33TJSERRY"};
				stack.push(externbook.Name);
				break;

			case 'PtgParen': /* 2.5.198.80 */
				var lp = '(', rp = ')';
				if(last_sp >= 0) {
					sp = "";
					switch(formula[0][last_sp][1][0]) {
						// $FlowIgnore
						case 2: lp = fill(" ", formula[0][last_sp][1][1]) + lp; break;
						// $FlowIgnore
						case 3: lp = fill("\r", formula[0][last_sp][1][1]) + lp; break;
						// $FlowIgnore
						case 4: rp = fill(" ", formula[0][last_sp][1][1]) + rp; break;
						// $FlowIgnore
						case 5: rp = fill("\r", formula[0][last_sp][1][1]) + rp; break;
						default:
							// $FlowIgnore
							if(opts.WTF) throw new Error("Unexpected PtgAttrSpaceType " + formula[0][last_sp][1][0]);
					}
					last_sp = -1;
				}
				stack.push(lp + stack.pop() + rp); break;

			case 'PtgRefErr': /* 2.5.198.86 */
				stack.push('#REF!'); break;

			case 'PtgRefErr3d': /* 2.5.198.87 */
				stack.push('#REF!'); break;

			case 'PtgExp': /* 2.5.198.58 TODO */
				c = {c:(f[1][1]/*:any*/),r:(f[1][0]/*:any*/)};
				var q = ({c: cell.c, r:cell.r}/*:any*/);
				if(supbooks.sharedf[encode_cell(c)]) {
					var parsedf = (supbooks.sharedf[encode_cell(c)]);
					stack.push(stringify_formula(parsedf, _range, q, supbooks, opts));
				}
				else {
					var fnd = false;
					for(e1=0;e1!=supbooks.arrayf.length; ++e1) {
						/* TODO: should be something like range_has */
						e2 = supbooks.arrayf[e1];
						if(c.c < e2[0].s.c || c.c > e2[0].e.c) continue;
						if(c.r < e2[0].s.r || c.r > e2[0].e.r) continue;
						stack.push(stringify_formula(e2[1], _range, q, supbooks, opts));
						fnd = true;
						break;
					}
					if(!fnd) stack.push(/*::String(*/f[1]/*::)*/);
				}
				break;

			case 'PtgArray': /* 2.5.198.32 TODO */
				stack.push("{" + stringify_array(/*::(*/f[1]/*:: :any)*/) + "}");
				break;

			case 'PtgMemArea': /* 2.5.198.70 TODO: confirm this is a non-display */
				//stack.push("(" + f[2].map(encode_range).join(",") + ")");
				break;

			case 'PtgAttrSpace': /* 2.5.198.38 */
			case 'PtgAttrSpaceSemi': /* 2.5.198.39 */
				last_sp = ff;
				break;

			case 'PtgTbl': /* 2.5.198.92 TODO */
				break;

			case 'PtgMemErr': /* 2.5.198.71 */
				break;

			case 'PtgMissArg': /* 2.5.198.74 */
				stack.push("");
				break;

			case 'PtgAreaErr': /* 2.5.198.29 */
				stack.push("#REF!"); break;

			case 'PtgAreaErr3d': /* 2.5.198.30 */
				stack.push("#REF!"); break;

			case 'PtgMemFunc': /* 2.5.198.72 TODO */
				break;
			case 'PtgMemNoMem': /* 2.5.198.73 TODO -- find a test case */
				throw new Error('Unrecognized Formula Token: ' + String(f));

			case 'PtgElfCol': /* 2.5.198.46 */
			case 'PtgElfColS': /* 2.5.198.47 */
			case 'PtgElfColSV': /* 2.5.198.48 */
			case 'PtgElfColV': /* 2.5.198.49 */
			case 'PtgElfLel': /* 2.5.198.50 */
			case 'PtgElfRadical': /* 2.5.198.51 */
			case 'PtgElfRadicalLel': /* 2.5.198.52 */
			case 'PtgElfRadicalS': /* 2.5.198.53 */
			case 'PtgElfRw': /* 2.5.198.54 */
			case 'PtgElfRwV': /* 2.5.198.55 */
				throw new Error("Unsupported ELFs");

			case 'PtgAttrBaxcel': /* 2.5.198.33 TODO -- find a test case*/
				throw new Error('Unrecognized Formula Token: ' + String(f));
			case 'PtgSxName': /* 2.5.198.91 TODO -- find a test case */
				throw new Error('Unrecognized Formula Token: ' + String(f));
			case 'PtgList': /* [MS-XLSB] 2.5.97.52 TODO -- find a test case */
				throw new Error('Unrecognized Formula Token: ' + String(f));

			default: throw new Error('Unrecognized Formula Token: ' + String(f));
		}
		var PtgNonDisp = ['PtgAttrSpace', 'PtgAttrSpaceSemi', 'PtgAttrGoto'];
		if(last_sp >= 0 && PtgNonDisp.indexOf(formula[0][ff][0]) == -1) {
			f = formula[0][last_sp];
			var _left = true;
			switch(f[1][0]) {
				/* note: some bad XLSB files omit the PtgParen */
				case 4: _left = false;
				/* falls through */
				case 0:
					// $FlowIgnore
					sp = fill(" ", f[1][1]); break;
				case 5: _left = false;
				/* falls through */
				case 1:
					// $FlowIgnore
					sp = fill("\r", f[1][1]); break;
				default:
					sp = "";
					// $FlowIgnore
					if(opts.WTF) throw new Error("Unexpected PtgAttrSpaceType " + f[1][0]);
			}
			stack.push((_left ? sp : "") + stack.pop() + (_left ? "" : sp));
			last_sp = -1;
		}
	}
	if(stack.length > 1 && opts.WTF) throw new Error("bad formula stack");
	return stack[0];
}


<?xml version="1.0" encoding="UTF-8"?>
<!--
     This file may be used under the terms of of the
     GNU General Public License Version 2 or later (the "GPL"),
     http://www.gnu.org/licenses/gpl.html


ListBucket:
ResultName:
Prefix:
Marker:
MaxKeys:
DelimiterI:
sTruncated:
Contents:      Metadata about each object returned.   Type: XML metadata    Ancestor: ListBucketResult
Key:
LastModified:
ETag:     The entity tag is an MD5 hash of the object. The ETag only reflects changes to the contents of an object, not its metadata.
Size:
Owner:    Bucket owner.    Type: String  Children: DisplayName, ID
ID: Object owner's ID.
Display:
Name: Name of the bucket.
StorageClass:
CommonPrefixes:
-->

<xsl:stylesheet version="1.0"
  xmlns:S3="http://s3.amazonaws.com/doc/2006-03-01/"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="/">
		<table cellspacing="0" id="keylist">
			<thead>
				<tr>
					<th align="left">File Name</th>
					<th align="left">Last Modified</th>
					<th align="left">Size (KB)</th>
					<th align="left">Type</th>
					<th align="left" class="delete_button" width="80">Action</th>
				</tr>
			</thead>
			
			<tbody>
				
				<xsl:for-each select="S3:ListBucketResult/S3:CommonPrefixes">
					<tr class="s3dir">
						<td><a class="icon icon-dir"><xsl:attribute name="href">/<xsl:value-of select="S3:Prefix"/></xsl:attribute><xsl:value-of select="S3:Prefix"/></a></td>
						<td><xsl:value-of select="S3:LastModified"/></td>
						<td><xsl:value-of select="S3:Size"/></td>
						<td>Folder</td>
						<td class="actions"></td>
					</tr>
				</xsl:for-each>
				

				<xsl:for-each select="S3:ListBucketResult/S3:Contents">
					<xsl:variable name='string' select='S3:Key'/>
					<xsl:variable name='size' select='S3:Size'/>
					<xsl:variable name='kb' select='1024'/>
							
							<xsl:choose>
								<xsl:when test="contains($string, '_$folder$') or not(contains($string, '.'))">
									<xsl:choose>
										<xsl:when test="contains($string, '_$folder$')"> 
											<!--	<a class="icon icon-dir-key"><xsl:attribute name="href">/<xsl:value-of select="concat((substring-before($string,'_$')),'/')"/></xsl:attribute><xsl:value-of select="substring-before($string,'_$')"/></a>				-->
										</xsl:when>
										<xsl:otherwise>
											<!--<a class="icon icon-dir-key"><xsl:attribute name="href">/<xsl:value-of select="concat($string,'/')"/></xsl:attribute><xsl:value-of select="$string"/></a>				-->
										</xsl:otherwise>
									</xsl:choose>						
								</xsl:when>
								
								<xsl:when test="contains($string, '.jpg') or contains($string, '.JPG') or contains($string, '.png') or contains($string, '.gif')">
									<tr>
									<xsl:attribute name="key"><xsl:value-of select="S3:Key"/></xsl:attribute>
									<td>
									<a class="icon icon-img"><xsl:attribute name="href">/<xsl:value-of select="S3:Key"/></xsl:attribute><xsl:value-of select="S3:Key"/></a>
									</td>
									<td><xsl:value-of select="S3:LastModified"/></td>
									<td><xsl:value-of select="format-number($size div $kb, '###.## KB')"/></td>
									<td>File</td>
									<td class="actions"><a href="#" class="delete" onclick="deleteKey(this.parentNode.parentNode); return false">delete</a></td>
									</tr>
								</xsl:when>
								
								<xsl:when test="contains($string, '.txt') or contains($string, '.doc') or contains($string, '.docx') or contains($string, '.pdf')">
									<tr>
									<xsl:attribute name="key"><xsl:value-of select="S3:Key"/></xsl:attribute>
									<td>
									<a class="icon icon-doc"><xsl:attribute name="href">/<xsl:value-of select="S3:Key"/></xsl:attribute><xsl:value-of select="S3:Key"/></a>
									</td>
									<td><xsl:value-of select="S3:LastModified"/></td>
									<td><xsl:value-of select="format-number($size div $kb, '###.## KB')"/></td>
									<td>File</td>
									<td class="actions"><a href="#" class="delete" onclick="deleteKey(this.parentNode.parentNode); return false">delete</a></td>
									</tr>
								</xsl:when>
								
								<xsl:when test="contains($string, '.mp3') or contains($string, '.wma')">
									<tr>
									<xsl:attribute name="key"><xsl:value-of select="S3:Key"/></xsl:attribute>
									<td>
									<a class="icon icon-music"><xsl:attribute name="href">/<xsl:value-of select="S3:Key"/></xsl:attribute><xsl:value-of select="S3:Key"/></a>
									</td>
									<td><xsl:value-of select="S3:LastModified"/></td>
									<td><xsl:value-of select="format-number($size div $kb, '###.## KB')"/></td>
									<td>File</td>
									<td class="actions"><a href="#" class="delete" onclick="deleteKey(this.parentNode.parentNode); return false">delete</a></td>
									</tr>
								</xsl:when>
								
								<xsl:when test="contains($string, '.avi') or contains($string, '.wmv') or contains($string, '.swf') or contains($string, '.mpg') or contains($string, '.mp4') or contains($string, '.mov') or contains($string, '.MP4') or contains($string, '.flv') or contains($string, '.mpeg')">
									<tr>
									<xsl:attribute name="key"><xsl:value-of select="S3:Key"/></xsl:attribute>
									<td>
									<a class="icon icon-video"><xsl:attribute name="href">/<xsl:value-of select="S3:Key"/></xsl:attribute><xsl:value-of select="S3:Key"/></a>
									</td>
									<td><xsl:value-of select="S3:LastModified"/></td>
									<td><xsl:value-of select="format-number($size div $kb, '###.## KB')"/></td>
									<td>File</td>
									<td class="actions"><a href="#" class="delete" onclick="deleteKey(this.parentNode.parentNode); return false">delete</a></td>
									</tr>
								</xsl:when>
								
								<xsl:otherwise>
									<tr>
									<xsl:attribute name="key"><xsl:value-of select="S3:Key"/></xsl:attribute>
									<td>
									<a class="icon icon-generic"><xsl:attribute name="href">/<xsl:value-of select="S3:Key"/></xsl:attribute><xsl:value-of select="S3:Key"/></a>
									</td>
									<td><xsl:value-of select="S3:LastModified"/></td>
									<td><xsl:value-of select="format-number($size div $kb, '###.## KB')"/></td>
									<td>File</td>
									<td class="actions"><a href="#" class="delete" onclick="deleteKey(this.parentNode.parentNode); return false">delete</a></td>
									</tr>
								</xsl:otherwise>
							</xsl:choose>	
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>
</xsl:stylesheet>


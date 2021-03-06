import React, { useCallback, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Panel from '../../components/Panel';
import { DocumentPreview, type DocumentPreviewProps } from '../../components/documents';
import { useRouter } from 'next/router';
import DocumentInfo from '../../components/documents/DocumentInfo';
import { Box } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import { type Document } from '../api/documents';
import Annotation from '../../components/documents/document-preview/Annotation';

type Anchor = string | null;

const Document: NextPage = () => {
	const {
		query: { id },
	} = useRouter();

	const { data: document } = useFetch<Document>(`/api/documents?id=${id}`);
	const { title } = useDocumentTitle(document?.id);

	const [activeAnchor, setActiveAnchor] = useState<Anchor>(null);

	const getAnnotationRenderer = useCallback(
		(activeAnchor?: Anchor) =>
			(({ str }) => {
				//FIXME: Redundant divs over non-anchors
				if (str[0] !== '#') return <div />;
				const anchorName = str.substring(1);

				return (
					<Annotation
						anchorName={anchorName}
						highlighted={activeAnchor === anchorName}
						onMouseEnter={() => setActiveAnchor(anchorName)}
						onMouseLeave={() => setActiveAnchor(null)}
					/>
				);
			}) as DocumentPreviewProps['annotationRenderer'],
		[]
	);

	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>

			<Panel title={id?.toString() || 'Unnamed document'} parentAnchor={'/catalog'}>
				{document && (
					<Box sx={{ display: 'flex', gap: 5 }}>
						<Box sx={{ minWidth: 500, flexShrink: 0 }}>
							<DocumentPreview
								file={document.url}
								annotationRenderer={getAnnotationRenderer(activeAnchor)}
							/>
						</Box>

						<DocumentInfo
							elements={document.elements}
							activeAnchor={activeAnchor}
							onActiveAnchorChange={anchorName => setActiveAnchor(anchorName)}
						/>
					</Box>
				)}
			</Panel>
		</>
	);
};

export default Document;

// TODO: Wrap document view in container
// FIXME: Documents not rendering after reload

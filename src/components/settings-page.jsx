import { __ } from '@wordpress/i18n';
import {
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalHeading as Heading,
    // eslint-disable-next-line @wordpress/no-unsafe-wp-apis
    __experimentalVStack as VStack,
    Button,
    Notice,
} from '@wordpress/components';
import { useState, useCallback } from "@wordpress/element";
import { DataForm } from '@wordpress/dataviews/wp';

const SettingsTitle = () => {
    return (
        <Heading level={ 1 }>
            { __( 'WP AI Workshop Demo', 'wp-ai-workshop-demo' ) }
        </Heading>
    );
};

const GenerateButton = ( { onClick } ) => {
    return (
        <div>
            <Button variant="primary" onClick={ onClick } __next40pxDefaultSize>
                { __( 'Generate', 'wp-ai-workshop-demo' ) }
            </Button>
        </div>
    );
};

const SettingsPage = () => {

    const [ noticeStatus, setNoticeStatus ] = useState( 'info' );
    const [ noticeMessage, setNoticeMessage ] = useState( 'Ready...' );

    const [input, setInput] = useState({
        title: "",
        prompt: "",
    });

    const fields = [
        {
            id: 'title',
            label: __( 'Title', 'wp-ai-workshop-demo' ),
            type: 'text',
        },
        {
            id: 'prompt',
            label: __( 'Prompt', 'wp-ai-workshop-demo' ),
            type: 'text',
            Edit: 'textarea',
        },
    ];

    const generateForm = {
        fields: [ 'title', 'prompt' ],
    };

    const updateNotice = ( message, status = 'info' ) => {
        setNoticeMessage( message );
        setNoticeStatus( status );
    }

    const onChange = ( edits ) => {
        setInput( ( current ) => ( {
            ...current,
            ...edits,
        } ) );
    };

    const generateFromInput = useCallback( async () => {
        // TODO: Use the Abilities API to execute the 'wp-ai-workshop-demo/generate-post' ability.
        updateNotice( 'Post generation is not yet implemented.', 'info' );
    }, [ input ] );

    return (
        <VStack spacing={ 4 }>
            <SettingsTitle/>
            <Notice status={ noticeStatus }>
                { noticeMessage }
            </Notice>
            <DataForm
                data={ input }
                fields={ fields }
                form={ generateForm }
                onChange={ onChange }
            />
            <GenerateButton onClick={ generateFromInput }/>
        </VStack>
    );
};

export { SettingsPage };

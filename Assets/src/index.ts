import grapesjs from 'grapesjs';
import { IBlockAttributes, IBlockItem } from './interfaces';

// declare type for window so ts will not complain during compiling
declare global {
    interface Window {
        MauticGrapesJsPlugins: object[];
        CustomBlockLoaderNamespace: any;
        id: any;
        Mautic: any;
    }
}

window.CustomBlockLoaderNamespace = window.CustomBlockLoaderNamespace || {};

const GrapesJsBlockLoader: grapesjs.Plugin = ( editor ) => {
    editor.on( 'load', () => {
        let themePath:any = '';
        let editorType = '';
        
        // email or page builder?
        if ( window.id !== null && window.id[0] !== null && typeof window.id[0] !== 'undefined' ) {
            if ( window.id[0].id === 'page_sessionId' ) {
                editorType = 'page';
            } else if ( window.id[0].id === 'emailform_sessionId' ) {
                editorType = 'email';
            }
        } else {
            const emailBuilder = document.querySelector( 'div.builder.email-builder' );
            const pageBuilder = document.querySelector( 'div.builder.page-builder' );
            if ( emailBuilder !== null ) {
                editorType = 'email';
            } else if ( pageBuilder !== null ) {
                editorType = 'page';
            }
        }
        
        // get the theme path
        if ( window.Mautic !== null && window.Mautic.builderTheme !== null) {
            themePath = window.Mautic.builderTheme;
        } else {
            const themeSelectedBtn = document.querySelectorAll( 'button.select-theme-selected' );
            if ( themeSelectedBtn !== null ) {
                const selectBtns = Array.from( themeSelectedBtn );
                selectBtns.forEach( button => {
                    if ( !button.classList.contains( 'hide' ) ) {
                        const parentOfThemeSelectedBtn = button.parentElement;
                        if ( parentOfThemeSelectedBtn !== null ) {
                            let themeHeading = parentOfThemeSelectedBtn.querySelector( 'a.select-theme-link.btn.btn-default.hide' );
                            if ( themeHeading !== null ) {
                                if ( themeHeading instanceof HTMLElement ) {
                                    themePath = themeHeading.dataset.theme;
                                }
                            }
                        }
                    }
                } );
            }
        }
        
        if ( themePath !== null && typeof themePath !== "undefined" && themePath !== '' && editorType !== '' ) {
            themePath = themePath.toLowerCase();
            let url = '';
            let scriptId = '';
            if ( editorType === 'page' ) {
                url = `/themes/${themePath}/blocks/blocks-page.js`;
            } else if ( editorType = 'email' ) {
                url = `/themes/${themePath}/blocks/blocks-email.js`;
            }
            
            // test if script is already injected, remove if so
            const injectedScript = document.getElementById( 'injectedBlocksScript' );
            if ( injectedScript !== null ) {
                injectedScript.remove();
            }
            
            // load and inject script
            // console.log( 'Will try to load: ' + url );
            
            return new Promise( ( resolve, reject ) => {
                let script  = document.createElement( 'script' );
                script.type = 'text/javascript';
                script.charset = 'utf-8';
                script.async = true;
                script.id = 'injectedBlocksScript';
                script.src = url;
                script.onload = () => {
                    resolve( script );
                    const bm = editor.BlockManager;
                    const allBlocks = bm.getAll();
                    
                    // remove default blocks
                    if ( window.CustomBlockLoaderNamespace.removeDefaults === true ) {
                        allBlocks.reset();
                    }
                    
                    // keep defined default blocks, remove others
                    if ( window.CustomBlockLoaderNamespace.removeDefaults === false && window.CustomBlockLoaderNamespace.blocksToKeep !== null && typeof window.CustomBlockLoaderNamespace.blocksToKeep !== 'undefined' && window.CustomBlockLoaderNamespace.blocksToKeep.length > 0 ) {
                        let blocksToRemove:any = [];
                        allBlocks.each( ( defaultBlock:any ) => {
                            if ( !window.CustomBlockLoaderNamespace.blocksToKeep.includes( defaultBlock.attributes.id ) ) {
                                blocksToRemove.push( defaultBlock.attributes.id );
                            }
                        } );
                        blocksToRemove.forEach( ( btr:any ) => {
                            bm.remove( btr );
                        });
                    }
                    
                    // add custom blocks
                    for ( const id in window.CustomBlockLoaderNamespace.blocks ) {
                        if ( typeof id == 'string' ) {
                            const blockItem: IBlockItem = window.CustomBlockLoaderNamespace.blocks[id];
                            bm.add( id, blockItem );
                        }
                    }
                };
                script.onerror = () => {
                    reject( new Error(`Script load error for ${url}`) );
                };
                document.body.appendChild( script );
            } ).catch( err => console.log( err.message ) );
            
        }
    });
}

// register the plugin globally so Mautic-GrapesJS can find it during initialization
if ( !window.MauticGrapesJsPlugins ) window.MauticGrapesJsPlugins = [];
window.MauticGrapesJsPlugins.push( {
    name: 'GrapesJsBlockLoader',
    plugin: GrapesJsBlockLoader,
    context: ['page', 'email-mjml', 'email-html'] // options: [page|email-mjml|email-html]
} );
